import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "civic_connect.db")

DEFAULT_OFFICER = {
    "id": "OFF-402",
    "name": "Er. R. B. Chauhan",
    "designation": "Executive Engineer (Civil) & Zonal Officer",
    "badge_number": "GNIDA-EE-2024-042",
    "department": "Public Works & Urban Infrastructure Division",
    "zone": "Zone 1 (Wards 1–15), Greater Noida",
    "phone": "+91 120 232-6000",
    "email": "officer.chauhan@gnida.in",
    "office_address": "GNIDA Administrative Complex, Sector Gamma-II, Greater Noida, UP - 201308",
    "jurisdiction_wards": [
        "Ward 1 (Alpha I & II)",
        "Ward 2 (Beta I & II)",
        "Ward 3 (Gamma I & II)",
        "Ward 4 (Delta I & II)",
        "Ward 12 (Knowledge Park III)",
        "Ward 14 (Pari Chowk Junction)"
    ],
    "shift_status": "Active On Duty — Morning Triage Shift",
    "last_login": "Today at 08:30 AM"
}

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(initial_incidents: Optional[List[Dict[str, Any]]] = None, workers: Optional[List[Dict[str, Any]]] = None, hotspots: Optional[List[Dict[str, Any]]] = None):
    conn = get_connection()
    cursor = conn.cursor()

    # Officer profile table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS officer_profile (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    """)

    # Incidents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            category TEXT,
            status TEXT,
            priority_level TEXT,
            priority_score REAL,
            ward TEXT,
            department TEXT,
            created_at TEXT,
            data TEXT NOT NULL
        )
    """)

    # Workers table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workers (
            id TEXT PRIMARY KEY,
            name TEXT,
            department TEXT,
            team TEXT,
            data TEXT NOT NULL
        )
    """)

    # Hotspots table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hotspots (
            id TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            risk_level TEXT,
            data TEXT NOT NULL
        )
    """)

    # Audit Logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            incident_id TEXT,
            actor TEXT,
            role TEXT,
            action TEXT,
            timestamp TEXT,
            data TEXT NOT NULL
        )
    """)

    # Seed Officer if not present
    cursor.execute("SELECT id FROM officer_profile WHERE id = ?", (DEFAULT_OFFICER["id"],))
    if not cursor.fetchone():
        cursor.execute("INSERT INTO officer_profile (id, data) VALUES (?, ?)", (DEFAULT_OFFICER["id"], json.dumps(DEFAULT_OFFICER)))

    # Seed workers if provided and empty
    if workers:
        cursor.execute("SELECT count(*) as cnt FROM workers")
        if cursor.fetchone()["cnt"] == 0:
            for w in workers:
                cursor.execute(
                    "INSERT INTO workers (id, name, department, team, data) VALUES (?, ?, ?, ?, ?)",
                    (w["id"], w["name"], w["department"], w["team"], json.dumps(w))
                )

    # Seed hotspots if provided and empty
    if hotspots:
        cursor.execute("SELECT count(*) as cnt FROM hotspots")
        if cursor.fetchone()["cnt"] == 0:
            for h in hotspots:
                cursor.execute(
                    "INSERT INTO hotspots (id, name, category, risk_level, data) VALUES (?, ?, ?, ?, ?)",
                    (h["id"], h["name"], h["category"], h["riskLevel"], json.dumps(h))
                )

    # Seed initial incidents if provided and empty
    if initial_incidents:
        cursor.execute("SELECT count(*) as cnt FROM incidents")
        if cursor.fetchone()["cnt"] == 0:
            for inc in initial_incidents:
                save_incident(inc, conn=conn)

    conn.commit()
    conn.close()

def get_officer_profile() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM officer_profile LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["data"])
    return DEFAULT_OFFICER

def update_officer_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    prof_id = data.get("id", "OFF-402")
    cursor.execute("INSERT OR REPLACE INTO officer_profile (id, data) VALUES (?, ?)", (prof_id, json.dumps(data)))
    conn.commit()
    conn.close()
    return data

def get_all_incidents() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM incidents ORDER BY rowid DESC")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(r["data"]) for r in rows]

def get_incident_by_id(incident_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM incidents WHERE id = ?", (incident_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["data"])
    return None

def save_incident(incident: Dict[str, Any], conn=None) -> Dict[str, Any]:
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    cursor = conn.cursor()
    inc_id = incident["id"]
    category = incident.get("category", "")
    status = incident.get("status", "SUBMITTED")
    priority_level = incident.get("priorityLevel", "MEDIUM")
    priority_score = incident.get("priorityScore", 50.0)
    ward = incident.get("location", {}).get("ward", "")
    department = incident.get("department", "")
    created_at = incident.get("createdAt", "")

    cursor.execute("""
        INSERT OR REPLACE INTO incidents (id, category, status, priority_level, priority_score, ward, department, created_at, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (inc_id, category, status, priority_level, priority_score, ward, department, created_at, json.dumps(incident)))

    if close_conn:
        conn.commit()
        conn.close()

    return incident

def get_all_workers() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM workers")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(r["data"]) for r in rows]

def get_all_hotspots() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM hotspots")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(r["data"]) for r in rows]

def reset_db_data(initial_incidents: List[Dict[str, Any]], workers: List[Dict[str, Any]], hotspots: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM incidents")
    cursor.execute("DELETE FROM workers")
    cursor.execute("DELETE FROM hotspots")
    cursor.execute("DELETE FROM officer_profile")
    cursor.execute("INSERT INTO officer_profile (id, data) VALUES (?, ?)", (DEFAULT_OFFICER["id"], json.dumps(DEFAULT_OFFICER)))

    for w in workers:
        cursor.execute(
            "INSERT INTO workers (id, name, department, team, data) VALUES (?, ?, ?, ?, ?)",
            (w["id"], w["name"], w["department"], w["team"], json.dumps(w))
        )

    for h in hotspots:
        cursor.execute(
            "INSERT INTO hotspots (id, name, category, risk_level, data) VALUES (?, ?, ?, ?, ?)",
            (h["id"], h["name"], h["category"], h["riskLevel"], json.dumps(h))
        )

    for inc in initial_incidents:
        save_incident(inc, conn=conn)

    conn.commit()
    conn.close()

