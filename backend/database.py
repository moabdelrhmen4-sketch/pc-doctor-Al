
import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).resolve().parent / "diagnosis.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS diagnoses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symptoms TEXT NOT NULL,
                results TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


def save_diagnosis(symptoms, results):
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO diagnoses (symptoms, results, created_at)
            VALUES (?, ?, ?)
            """,
            (
                json.dumps(symptoms),
                json.dumps(results),
                datetime.now(timezone.utc).isoformat()
            )
        )
        return cursor.lastrowid


def get_diagnosis_history():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, symptoms, results, created_at
            FROM diagnoses
            ORDER BY id DESC
            LIMIT 100
            """
        ).fetchall()

    history = []

    for row in rows:
        history.append({
            "id": row["id"],
            "symptoms": json.loads(row["symptoms"]),
            "results": json.loads(row["results"]),
            "created_at": row["created_at"]
        })

    return history


def delete_diagnosis_history():
    with get_connection() as connection:
        connection.execute("DELETE FROM diagnoses")
