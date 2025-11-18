from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from db.database import init_db
from models.users import get_user, get_all_users, create_user, update_user, delete_user
from models.doors import get_door, get_all_doors, create_door, update_door, delete_door
from models.access import get_all_access_for_user, get_access, grant_access, revoke_access
from fastapi import Body
from fastapi import Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import timedelta, datetime
from dotenv import load_dotenv
import secrets
import torch
import torch.nn as nn
import torchvision.models as models
import numpy as np
import cv2
from models.logs import add_log, get_logs

from preprocessing import preprocess_image, transform_test
from model_loader import load_model, predict_tensor
from config import ALLOWED_EXT, CLASSES, IMAGE_SIZE

load_dotenv()

# Initialize DB
init_db()

model = load_model()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Model Loaded on {device}")


app = FastAPI(title="Access Control API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------- Pydantic Models -------------------

class UserCreate(BaseModel):
    user_id: str
    name: str
    role: str
    last_updated: str

class UserUpdate(BaseModel):
    name: str = None
    role: str = None
    last_updated: str = None

class DoorCreate(BaseModel):
    door_id: str
    location: str

class DoorUpdate(BaseModel):
    location: str

class AccessUpdate(BaseModel):
    user_id: str
    door_id: str
    access_granted: bool
    access_updated: str


# ------------------- Users -------------------

@app.get("/users")
def api_get_users():
    return get_all_users()

@app.get("/users/{user_id}")
def api_get_user(user_id: str):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_list = get_all_access_for_user(user_id)
    return {"user": user, "access": access_list}

@app.post("/users")
def api_create_user(user: UserCreate):
    if get_user(user.user_id):
        raise HTTPException(status_code=400, detail="User already exists")
    create_user(user.user_id, user.name, user.role, user.last_updated)
    return {"message": "User created successfully"}

@app.put("/users/{user_id}")
def api_update_user(user_id: str, user: UserUpdate):
    if not get_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    update_user(user_id, user.name, user.role, user.last_updated)
    return {"message": "User updated successfully"}

@app.delete("/users/{user_id}")
def api_delete_user(user_id: str):
    if not get_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    delete_user(user_id)
    return {"message": "User deleted successfully"}


# ------------------- Doors -------------------

@app.get("/doors")
def api_get_doors():
    return get_all_doors()

@app.get("/doors/{door_id}")
def api_get_door(door_id: str):
    door = get_door(door_id)
    if not door:
        raise HTTPException(status_code=404, detail="Door not found")
    return door

@app.post("/doors")
def api_create_door(door: DoorCreate):
    if get_door(door.door_id):
        raise HTTPException(status_code=400, detail="Door already exists")
    create_door(door.door_id, door.location)
    return {"message": "Door created successfully"}

@app.put("/doors/{door_id}")
def api_update_door(door_id: str, door: DoorUpdate):
    if not get_door(door_id):
        raise HTTPException(status_code=404, detail="Door not found")
    update_door(door_id, door.location)
    return {"message": "Door updated successfully"}

@app.delete("/doors/{door_id}")
def api_delete_door(door_id: str):
    if not get_door(door_id):
        raise HTTPException(status_code=404, detail="Door not found")
    delete_door(door_id)
    return {"message": "Door deleted successfully"}


# ------------------- Access -------------------

@app.get("/access/{user_id}")
def api_get_access_for_user(user_id: str):
    if not get_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return get_all_access_for_user(user_id)

@app.post("/access")
def api_grant_access(access: AccessUpdate):
    if not get_user(access.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if not get_door(access.door_id):
        raise HTTPException(status_code=404, detail="Door not found")
    grant_access(access.user_id, access.door_id, int(access.access_granted), access.access_updated)
    return {"message": "Access updated successfully"}

@app.put("/access")
def api_update_access(access: AccessUpdate):
    if not get_user(access.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if not get_door(access.door_id):
        raise HTTPException(status_code=404, detail="Door not found")
    grant_access(access.user_id, access.door_id, int(access.access_granted), access.access_updated)
    return {"message": "Access updated successfully"}

@app.delete("/access")
def api_revoke_access(payload: dict = Body(...)):
    user_id = payload.get("user_id")
    door_id = payload.get("door_id")

    if not user_id or not door_id:
        raise HTTPException(status_code=400, detail="user_id and door_id required")

    if not get_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    if not get_door(door_id):
        raise HTTPException(status_code=404, detail="Door not found")

    revoke_access(user_id, door_id)
    return {"message": "Access revoked successfully"}


#------------------- Admin -------------------
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# In-memory session storage
sessions = {}

SESSION_DURATION = timedelta(minutes=30)
def create_session():
    token = secrets.token_hex(32)
    sessions[token] = datetime.utcnow() + SESSION_DURATION
    return token


def validate_session(token: str):
    if token in sessions:
        if datetime.utcnow() < sessions[token]:
            return True
        del sessions[token]
    return False

@app.post("/admin/login")
def admin_login(data: dict, response: Response):
    username = data.get("username")
    password = data.get("password")

    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session_token = create_session()

    response.set_cookie(
        key="admin_session",
        value=session_token,
        httponly=True,
        samesite="Lax",
        max_age=SESSION_DURATION.seconds,
    )

    return {"message": "Login successful"}


@app.get("/admin/protected")
def protected_route(request: Request):
    session_token = request.cookies.get("admin_session")

    if not session_token or not validate_session(session_token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    return {"message": "You are authenticated"}


@app.post("/admin/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get("admin_session")
    if token in sessions:
        del sessions[token]
    response.delete_cookie("admin_session")
    return {"message": "Logged out"}

@app.get("/admin/check")
def admin_check(request: Request):
    session_token = request.cookies.get("admin_session")

    if not session_token or not validate_session(session_token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    return {"authenticated": True}


# ------------------- Thermal Image Prediction -------------------

@app.post("/predict")
async def predict_thermal_image(file: UploadFile = File(...)):
    filename = file.filename.lower()

    if not filename.endswith(ALLOWED_EXT):
        raise HTTPException(status_code=400, detail="Invalid image format")

    # Read & decode image
    bytes_data = await file.read()
    arr = np.frombuffer(bytes_data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        raise HTTPException(status_code=422, detail="Could not decode image")

    # Preprocessing
    processed = preprocess_image(img)
    tensor = transform_test(processed).unsqueeze(0).to(device)

    # Predict
    label, confidence = predict_tensor(model, tensor)

    return {
        "file": file.filename,
        "prediction": label,
        "confidence": confidence
    }

# ------------------- logs-------------------
@app.get("/logs")
def api_get_logs():
    """Return all logs sorted in descending timestamp order."""
    try:
        logs = get_logs()
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/logs")
def api_write_log(payload: dict):
    """
    Expected JSON:
    {
        "timestamp": "...",
        "user_id": "S3",
        "user_name": "User3",
        "door_id": "D005",
        "door_location": "Secure Conference Vault",
        "status": "SUCCESS"
    }
    """

    required_fields = ["timestamp", "user_id", "user_name", "door_id", "door_location", "status"]

    # Validate input
    if not all(field in payload for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing log fields")

    try:
        add_log(
            payload["timestamp"],
            payload["user_id"],
            payload["user_name"],
            payload["door_id"],
            payload["door_location"],
            payload["status"]
        )
        return {"message": "Log entry stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write log: {e}")
