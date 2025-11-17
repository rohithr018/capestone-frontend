from db.database import get_connection

def add_log(timestamp, user_id, user_name, door_id, door_location, status):
    """Insert a new log entry into DB"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO logs (timestamp, user_id, user_name, door_id, door_location, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (timestamp, user_id, user_name, door_id, door_location, status))

    conn.commit()
    conn.close()


def get_logs():
    """Fetch all logs sorted by newest first"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC")
    rows = cursor.fetchall()

    conn.close()
    return [dict(row) for row in rows]
