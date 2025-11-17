from datetime import datetime, timedelta
import random

from db.database import init_db, reset_db, get_connection
from models.users import create_user
from models.doors import create_door
from models.access import grant_access

# ----------------------------------------------------
# RESET + INIT
# ----------------------------------------------------
print("\n🔄 Resetting database...")
reset_db()
init_db()
print("✔ Database reset & initialized successfully!\n")

print("🚀 Seeding data...\n")

# ----------------------------------------------------
# DOORS
# ----------------------------------------------------
doors = [
    {"door_id": "D001", "location": "Vault A - Main Asset Storage"},
    {"door_id": "D002", "location": "Vault B - Digital Archive Unit"},
    {"door_id": "D003", "location": "Biometric Containment Room"},
    {"door_id": "D004", "location": "Server Vault - Core Data Center"},
    {"door_id": "D005", "location": "Secure Conference Vault"},
    {"door_id": "D006", "location": "HR Identity Verification Suite"},
    {"door_id": "D007", "location": "Financial High-Security Vault"},
    {"door_id": "D008", "location": "Advanced Biometric Access Lab"},
    {"door_id": "D009", "location": "Top Security Communications Hub"},
    {"door_id": "D010", "location": "Central Authorization Gate"},
]

for d in doors:
    create_door(d["door_id"], d["location"])
    print(f" ➤ Door Seeded: {d['door_id']} — {d['location']}")

# ----------------------------------------------------
# USERS
# ----------------------------------------------------
users = [
    {"user_id": "S1", "name": "User1", "role": "Manager"},
    {"user_id": "S2", "name": "User2", "role": "Engineer"},
    {"user_id": "S3", "name": "User3", "role": "Technician"},
    {"user_id": "S4", "name": "User4", "role": "HR"},
    {"user_id": "S5", "name": "User5", "role": "Finance"},
    {"user_id": "S6", "name": "User6", "role": "Manager"},
    {"user_id": "S7", "name": "User7", "role": "Engineer"},
    {"user_id": "S8", "name": "User8", "role": "Technician"},
    {"user_id": "S9", "name": "User9", "role": "HR"},
    {"user_id": "S10", "name": "User10", "role": "Finance"},
]

# Access map
access_map = {
    "S1": ["D001", "D002"],
    "S2": ["D003", "D004"],
    "S3": ["D005"],
    "S4": ["D006"],
    "S5": ["D007"],
    "S6": ["D001", "D005"],
    "S7": ["D004", "D010"],
    "S8": ["D008"],
    "S9": ["D009", "D006"],
    "S10": ["D010"],
}

# Insert users + access
now = datetime.utcnow().isoformat()

for user in users:
    create_user(user["user_id"], user["name"], user["role"], now)
    print(f" ➤ User Seeded: {user['user_id']} — {user['name']}")

    for door_id in access_map.get(user["user_id"], []):
        grant_access(user["user_id"], door_id, 1, now)
        print(f"    ✔ Granted Access: {user['user_id']} → {door_id}")

# ----------------------------------------------------
# SEED FAKE LOGS (NEW)
# ----------------------------------------------------
def seed_logs(n=50):
    print("\n📝 Seeding fake logs...")

    conn = get_connection()
    cursor = conn.cursor()

    statuses = ["SUCCESS", "DENIED"]

    # expand to real entries from DB
    cursor.execute("SELECT user_id, name FROM users")
    user_list = cursor.fetchall()

    cursor.execute("SELECT door_id, location FROM doors")
    door_list = cursor.fetchall()

    for _ in range(n):
        user = random.choice(user_list)
        door = random.choice(door_list)

        # random timestamp (last 5 days)
        timestamp = (datetime.utcnow() - timedelta(
            minutes=random.randint(10, 7200)
        )).isoformat()

        status = random.choice(statuses)

        cursor.execute("""
            INSERT INTO logs (timestamp, user_id, user_name, door_id, door_location, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            user["user_id"],
            user["name"],
            door["door_id"],
            door["location"],
            status,
        ))

    conn.commit()
    conn.close()
    print(f"✔ Inserted {n} fake logs successfully!")


seed_logs(50)

print("\n🎯 DATABASE SEEDING COMPLETE!\n")
