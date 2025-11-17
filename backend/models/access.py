import sqlite3
from db.database import get_connection

def grant_access(user_id, door_id, access_granted, access_updated):
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO user_access (user_id, door_id, access_granted, access_updated)
        VALUES (?, ?, ?, ?)
    """, (user_id, door_id, access_granted, access_updated))
    conn.commit()
    conn.close()

def get_access(user_id, door_id):
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_access WHERE user_id=? AND door_id=?", (user_id, door_id))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def revoke_access(user_id, door_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_access WHERE user_id=? AND door_id=?", (user_id, door_id))
    conn.commit()
    conn.close()

def get_all_access_for_user(user_id):
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_access WHERE user_id=?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
