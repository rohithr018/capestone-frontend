import sqlite3
from db.database import DB_NAME

# ---------------- Users CRUD ----------------

def get_user(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id=?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"user_id": row[0], "name": row[1], "role": row[2], "last_updated": row[3]}
    return None

def get_all_users():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    conn.close()
    return [{"user_id": r[0], "name": r[1], "role": r[2], "last_updated": r[3]} for r in rows]

def create_user(user_id, name, role, last_updated):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (user_id, name, role, last_updated) VALUES (?, ?, ?, ?)",
                   (user_id, name, role, last_updated))
    conn.commit()
    conn.close()

def update_user(user_id, name=None, role=None, last_updated=None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    if name:
        cursor.execute("UPDATE users SET name=? WHERE user_id=?", (name, user_id))
    if role:
        cursor.execute("UPDATE users SET role=? WHERE user_id=?", (role, user_id))
    if last_updated:
        cursor.execute("UPDATE users SET last_updated=? WHERE user_id=?", (last_updated, user_id))
    conn.commit()
    conn.close()

def delete_user(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()
