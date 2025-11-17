import sqlite3
from sqlite3 import Connection

DB_NAME = "access_control.db"

def get_connection() -> Connection:
    """Get a SQLite database connection"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        last_updated TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doors (
        door_id TEXT PRIMARY KEY,
        location TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_access (
        user_id TEXT,
        door_id TEXT,
        access_granted INTEGER,
        access_updated TEXT,
        PRIMARY KEY(user_id, door_id),
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        FOREIGN KEY(door_id) REFERENCES doors(door_id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        door_id TEXT NOT NULL,
        door_location TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        FOREIGN KEY(door_id) REFERENCES doors(door_id)
    )
    """)

    conn.commit()
    conn.close()
    print("✔ Database initialized with logs table!")


def reset_db():
    """Drop existing tables to reset database completely"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS logs")
    cursor.execute("DROP TABLE IF EXISTS user_access")
    cursor.execute("DROP TABLE IF EXISTS doors")
    cursor.execute("DROP TABLE IF EXISTS users")

    conn.commit()
    conn.close()
    print("Database fully reset!")
