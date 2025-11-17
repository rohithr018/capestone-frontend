import sqlite3
from db.database import get_connection

# ---------------- Doors CRUD ----------------

def create_door(door_id, location):
    """Create a new door"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO doors (door_id, location)
        VALUES (?, ?)
    """, (door_id, location))
    conn.commit()
    conn.close()

def get_door(door_id):
    """Get a single door by door_id"""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doors WHERE door_id = ?", (door_id,))
    door = cursor.fetchone()
    conn.close()
    return dict(door) if door else None

def get_all_doors():
    """Get all doors"""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doors")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_door(door_id, location):
    """Update door location"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE doors SET location = ? WHERE door_id = ?", (location, door_id))
    conn.commit()
    conn.close()

def delete_door(door_id):
    """Delete a door by door_id"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM doors WHERE door_id = ?", (door_id,))
    conn.commit()
    conn.close()
