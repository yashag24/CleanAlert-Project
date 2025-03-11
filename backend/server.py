import os
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from PIL import Image
import numpy as np
import tensorflow as tf
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import email.utils
from datetime import datetime
import logging
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
FROM_EMAIL = os.getenv("FROM_EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
TO_EMAIL = os.getenv("TO_EMAIL")
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-for-development-only")
UPLOAD_FOLDER = "uploads"  # Directory to save uploaded images
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "garbage_detection"

# Validate required environment variables
if not all([FROM_EMAIL, EMAIL_PASSWORD, TO_EMAIL]):
    logger.error("❌ Missing email configuration in .env file")
    exit(1)

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Flask
app = Flask(__name__)
app.secret_key = SECRET_KEY
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Security middleware
CORS(app, origins=["http://localhost:5173"])  # Update with your frontend URL
Talisman(app, content_security_policy=None)  # Disable CSP for simplicity

# Rate limiting
limiter = Limiter(
    app=app, key_func=get_remote_address, default_limits=["200 per day", "100 per hour"]
)

# WebSockets
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB Client
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# Load TensorFlow Model
try:
    model = tf.keras.models.load_model("model_deep.keras")
    logger.info("✅ Model loaded successfully")
except Exception as e:
    logger.error(f"❌ Model loading failed: {e}")
    model = None


# Helper Functions
def get_location_name(lat, lon):
    """Get human-readable address using OpenStreetMap."""
    try:
        response = requests.get(
            f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}",
            headers={"User-Agent": "RoadsideGarbageDetection/1.0"},
            timeout=10,
        )
        data = response.json()
        address = data.get("address", {})
        return (
            ", ".join(
                filter(
                    None,
                    [
                        address.get("road"),
                        address.get("city"),
                        address.get("state"),
                        address.get("country"),
                    ],
                )
            )
            or "Unknown Location"
        )
    except Exception as e:
        logger.error(f"❌ Location lookup failed: {str(e)}")
        return None


def send_email(subject, body):
    """Send email notifications when garbage is detected."""
    try:
        msg = MIMEMultipart()
        msg["From"] = FROM_EMAIL
        msg["To"] = TO_EMAIL
        msg["Subject"] = subject
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(FROM_EMAIL, EMAIL_PASSWORD)
            server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())

        logger.info("✅ Email sent successfully")
    except Exception as e:
        logger.error(f"❌ Email sending failed: {e}")


def preprocess_image(image):
    """Prepare image for TensorFlow model prediction."""
    try:
        img = image.convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        return np.expand_dims(img_array, axis=0)
    except Exception as e:
        logger.error(f"❌ Image preprocessing failed: {e}")
        raise


def validate_file(file):
    """Validate the uploaded file."""
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    max_size = 5 * 1024 * 1024  # 5MB

    if file.content_type not in allowed_types:
        return False, "Invalid file type. Only JPEG, PNG, and JPG are allowed."
    if file.content_length > max_size:
        return False, "File size exceeds the maximum limit of 5MB."
    return True, None


# User Management Functions
def create_user(email, password):
    """Create a new user in MongoDB."""
    if db.users.find_one({"email": email}):
        return None  # User already exists

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    result = db.users.insert_one(
        {
            "email": email,
            "password": hashed,
            "created_at": datetime.now().isoformat(),
            "role": "user",
        }
    )
    return str(result.inserted_id)


def authenticate_user(email, password):
    """Authenticate a user."""
    user = db.users.find_one({"email": email})
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "user"),
        }
    return None


# Routes
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
        return jsonify({"message": "User registered successfully"}), 201
    return jsonify({"error": "User already exists"}), 409


@app.route("/api/login", methods=["POST"])
def login():
    """User authentication."""
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = authenticate_user(email, password)
    if user:
        return (
            jsonify(
                {
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "role": user["role"],
                    }
                }
            ),
            200,
        )
    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/upload", methods=["POST"])
@limiter.limit("100 per minute")
def upload_image():
    """Handle image upload and run prediction."""
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]

    # Validate file type and size
    is_valid, error_message = validate_file(image_file)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    try:
        lat = request.form.get("latitude", type=float)
        lon = request.form.get("longitude", type=float)

        # Validate coordinates
        if lat is None or lon is None:
            logger.error("❌ Latitude and longitude are required")
            return jsonify({"error": "Latitude and longitude are required"}), 400

        # Get human-readable address
        location_name = get_location_name(lat, lon)
        logger.info(f"📍 Location: {location_name}")

        # Save the uploaded file
        filename = secure_filename(image_file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        image_file.save(filepath)
        logger.info(f"📤 Saved file: {filepath}")

        # Generate the permanent image URL
        image_url = f"http://localhost:5000/uploads/{filename}"

        # Open and preprocess the image
        img = Image.open(filepath)
        img_array = preprocess_image(img)

        if not model:
            return jsonify({"error": "Model not loaded"}), 500

        # Make prediction
        prediction = model.predict(img_array)
        class_idx = np.argmax(prediction)
        class_label = "Garbage" if class_idx == 1 else "Clean"
        confidence = float(prediction[0][class_idx])

        # Store data in MongoDB
        detection_data = {
            "prediction": class_label,
            "confidence": confidence,
            "latitude": lat,
            "longitude": lon,
            "location_name": location_name,
            "image_url": image_url,
            "timestamp": datetime.now().isoformat(),
            "status": "pending",
            "source": "user_upload",
        }
        result = db.detections.insert_one(detection_data)
        detection_data["_id"] = str(result.inserted_id)

        # Convert to JSON-serializable format
        response_data = {
            "prediction": detection_data["prediction"],
            "confidence": detection_data["confidence"],
            "latitude": detection_data["latitude"],
            "longitude": detection_data["longitude"],
            "location_name": detection_data["location_name"],
            "timestamp": detection_data["timestamp"],
            "id": detection_data["_id"],
            "image_url": image_url,
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
            socketio.emit("new_detection", response_data)  # Emit WebSocket event

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"❌ Processing error: {e}")
        return jsonify({"error": "Image processing failed"}), 500


@app.route("/api/detections", methods=["GET"])
def get_detections():
    """Fetch all detections."""
    try:
        detections = list(db.detections.find({}))
        for detection in detections:
            detection["id"] = str(detection["_id"])
            del detection["_id"]  # Convert ObjectId to string
        return jsonify(detections), 200
    except Exception as e:
        logger.error(f"❌ Failed to fetch detections: {e}")
        return jsonify({"error": "Failed to fetch detections"}), 500


@app.route("/api/detections/<detection_id>", methods=["DELETE"])
def delete_detection(detection_id):
    """Delete a detection by ID."""
    try:
        result = db.detections.delete_one({"_id": ObjectId(detection_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Detection not found"}), 404

        socketio.emit("delete_detection", detection_id)  # Notify frontend
        return jsonify({"message": "Detection deleted"}), 200
    except Exception as e:
        logger.error(f"❌ Failed to delete detection: {e}")
        return jsonify({"error": "Failed to delete detection"}), 500


# Serve static files from the uploads directory
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/api/detections/<detection_id>/status", methods=["PATCH"])
def update_detection_status(detection_id):
    """Update the status of a detection."""
    try:
        data = request.json
        new_status = data.get("status")

        # Validate the new status
        valid_statuses = ["pending", "in_progress", "completed"]
        if new_status not in valid_statuses:
            return jsonify({"error": "Invalid status"}), 400

        # Update the status in MongoDB
        result = db.detections.update_one(
            {"_id": ObjectId(detection_id)}, {"$set": {"status": new_status}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Detection not found"}), 404

        # Fetch the updated detection
        updated_detection = db.detections.find_one({"_id": ObjectId(detection_id)})
        updated_detection["id"] = str(updated_detection["_id"])
        del updated_detection["_id"]

        # Emit WebSocket event to notify clients
        socketio.emit("status_update", updated_detection)

        return jsonify(updated_detection), 200
    except Exception as e:
        logger.error(f"❌ Failed to update status: {e}")
        return jsonify({"error": "Failed to update status"}), 500


# WebSocket event handlers
@socketio.on("connect")
def handle_connect():
    logger.info("✅ Client connected via WebSocket")


@socketio.on("disconnect")
def handle_disconnect():
    logger.info("❌ Client disconnected")


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
