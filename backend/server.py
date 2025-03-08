import tensorflow as tf
import numpy as np
import requests  # Add this import
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from PIL import Image
import smtplib
import os
import logging
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import email.utils
from datetime import datetime
from werkzeug.utils import secure_filename
from models import create_user, authenticate_user, create_detection_entry

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
FROM_EMAIL = os.getenv("FROM_EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
TO_EMAIL = os.getenv("TO_EMAIL")
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-for-development-only")  # Fallback for development

# Validate required environment variables
if not all([FROM_EMAIL, EMAIL_PASSWORD, TO_EMAIL]):
    logger.error("❌ Missing email configuration in .env file")
    exit(1)

# Initialize Flask
app = Flask(__name__)
app.secret_key = SECRET_KEY

# Security middleware
CORS(app, origins=["http://localhost:5173"])  # Update with your frontend URL
Talisman(app, content_security_policy=None)  # Disable CSP for simplicity

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# WebSockets
socketio = SocketIO(app, cors_allowed_origins="*")

# Load TensorFlow Model
try:
    model = tf.keras.models.load_model("model_deep.keras")
    logger.info("✅ Model loaded successfully")
except Exception as e:
    logger.error(f"❌ Model loading failed: {e}")
    model = None

def get_location_name(lat, lon):
    """Get human-readable address using OpenStreetMap"""
    try:
        response = requests.get(
            f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}",
            headers={'User-Agent': 'RoadsideGarbageDetection/1.0'},
            timeout=10
        )
        data = response.json()
        address = data.get('address', {})
        return ", ".join(filter(None, [
            address.get('road'),
            address.get('city'),
            address.get('state'),
            address.get('country')
        ])) or "Unknown Location"
    except Exception as e:
        logger.error(f"❌ Location lookup failed: {str(e)}")
        return None

def send_email(subject, body):
    """Send email notifications when garbage is detected."""
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = TO_EMAIL
        msg['Subject'] = subject
        msg['Date'] = email.utils.formatdate(localtime=True)
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(FROM_EMAIL, EMAIL_PASSWORD)
            server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())

        logger.info("✅ Email sent successfully")
    except Exception as e:
        logger.error(f"❌ Email sending failed: {e}")

def preprocess_image(image):
    """Prepare image for TensorFlow model prediction."""
    img = image.convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

@app.route("/upload", methods=["POST"])
@limiter.limit("10 per minute")
def upload_image():
    """Handle image upload and run prediction."""
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:
        image_file = request.files["image"]
        lat = request.form.get("latitude", type=float)  # Get latitude from form data
        lon = request.form.get("longitude", type=float)  # Get longitude from form data

        # Validate coordinates
        if lat is None or lon is None:
            logger.error("❌ Latitude and longitude are required")
            return jsonify({"error": "Latitude and longitude are required"}), 400

        # Get human-readable address
        location_name = get_location_name(lat, lon)
        logger.info(f"📍 Location: {location_name}")

        logger.info(f"📤 Received file: {image_file.filename} ({image_file.content_length} bytes)")
        logger.info(f"📍 Coordinates: {lat}, {lon}")

        img = Image.open(image_file)
        img_array = preprocess_image(img)

        if not model:
            return jsonify({"error": "Model not loaded"}), 500

        prediction = model.predict(img_array)
        class_idx = np.argmax(prediction)
        class_label = "Garbage" if class_idx == 1 else "Clean"
        confidence = float(prediction[0][class_idx])

        # Store data in MongoDB with latitude, longitude, and location name
        detection_data = create_detection_entry(
            prediction=class_label,
            confidence=confidence,
            latitude=lat,
            longitude=lon,
            location_name=location_name
        )

        # Convert to JSON-serializable format
        response_data = {
            "prediction": detection_data["prediction"],
            "confidence": detection_data["confidence"],
            "latitude": detection_data["latitude"],
            "longitude": detection_data["longitude"],
            "location_name": detection_data["location_name"],
            "timestamp": detection_data["timestamp"],  # Already converted to string
            "id": str(detection_data["_id"])  # Convert ObjectId to string
        }

        if class_label == "Garbage":
            email_body = (
                "🚨 Garbage Detected 🚨\n\n"
                f"Confidence: {confidence:.2%}\n"
                f"Coordinates: {lat:.6f}, {lon:.6f}\n"
                f"Address: {location_name or 'Unknown location'}\n"
                f"Timestamp: {detection_data['timestamp']}\n"
            )
            send_email("Garbage Detection Alert", email_body)
            socketio.emit("new_detection", response_data)  # Use modified data

        return jsonify(response_data)  # Return modified data

    except Exception as e:
        logger.error(f"❌ Processing error: {e}")
        return jsonify({"error": "Image processing failed"}), 500

@app.route("/api/register", methods=["POST"])
def register():
    """User registration."""
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user_id = create_user(email, password)
    if user_id:
        return jsonify({"message": "User registered successfully"})
    return jsonify({"error": "Registration failed"}), 400

@app.route("/api/login", methods=["POST"])
def login():
    """User authentication."""
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = authenticate_user(email, password)
    if user:
        return jsonify({"user": {"email": user["email"], "role": user.get("role", "user")}})
    return jsonify({"error": "Invalid credentials"}), 401

@socketio.on("connect")
def handle_connect():
    logger.info("✅ Client connected via WebSocket")

@socketio.on("disconnect")
def handle_disconnect():
    logger.info("❌ Client disconnected")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)