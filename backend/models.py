from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv
import bcrypt
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    logger.info("✅ Connected to MongoDB")
except Exception as e:
    logger.error(f"❌ MongoDB connection failed: {e}")
    raise

db = client["garbage_detection"]
users_collection = db["users"]
detections_collection = db["detections"]

# Create indexes
users_collection.create_index("email", unique=True)
detections_collection.create_index("timestamp")

def create_user(email, password):
    """Create a new user with hashed password."""
    if users_collection.find_one({"email": email}):
        logger.warning(f"User already exists: {email}")
        return None
    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        "email": email,
        "password": hashed,
        "role": "user",
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user)
    logger.info(f"✅ New user created: {email}")
    return str(result.inserted_id)

def authenticate_user(email, password):
    """Authenticate user with bcrypt."""
    user = users_collection.find_one({"email": email})
    if not user:
        logger.warning(f"❌ Login attempt for non-existent user: {email}")
        return None
    
    if bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        logger.info(f"✅ Successful login: {email}")
        return user
    logger.warning(f"❌ Invalid password for: {email}")
    return None

def create_detection_entry(prediction, confidence, latitude=None, longitude=None,location_name=None):
    """Store detection result with location data."""
    detection = {
        "prediction": prediction,
        "confidence": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": datetime.utcnow().isoformat(),
        "location_name":location_name  # Convert datetime to ISO format string
    }
    result = detections_collection.insert_one(detection)
    
    # Convert MongoDB document to JSON-serializable format
    detection["_id"] = str(result.inserted_id)  # Convert ObjectId to string
    logger.info(f"📝 New detection recorded: {prediction} ({confidence:.2%})")
    return detection