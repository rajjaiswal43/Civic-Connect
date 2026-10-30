import sqlite3
import json
import os
import hashlib
import secrets
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

DB_FILE = os.path.join(os.path.dirname(__file__), "civic_connect.db")

DEFAULT_OFFICER = {
    "id": "OFF-YK-01",
    "name": "Yash Kumar",
    "designation": "Zonal Executive Officer & Infrastructure Superintendent",
    "badge_number": "GNIDA-EO-9761",
    "department": "Roads & Public Works Department",
    "zone": "Central City Zone (Wards 12, 14 & 15)",
    "phone": "+91 9761003007",
    "email": "yash.kumar@pwd.delhi.gov.in",
    "mobile": "9761003007",
    "office_address": "Municipal Zonal Headquarters, Sector Knowledge Park III, Greater Noida, UP - 201310",
    "jurisdiction_wards": [
        "Ward 12 (Knowledge Park III)",
        "Ward 14 (Pari Chowk Junction)",
        "Ward 15 (Commercial Hub)"
    ],
    "shift_status": "Active On Duty — Zonal Triage Command",
    "last_login": "Today at 09:00 AM"
}

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return key.hex(), salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return secrets.compare_digest(key.hex(), password_hash)

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

    # Officers account table (secure credentials)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS officers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL UNIQUE,
            email TEXT,
            department TEXT,
            designation TEXT,
            jurisdiction TEXT,
            badge_number TEXT,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            is_verified INTEGER DEFAULT 1,
            approval_status TEXT DEFAULT 'APPROVED',
            office_address TEXT,
            created_at TEXT NOT NULL
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

    # Seed Officer Profile for Yash Kumar
    cursor.execute("INSERT OR REPLACE INTO officer_profile (id, data) VALUES (?, ?)", (DEFAULT_OFFICER["id"], json.dumps(DEFAULT_OFFICER)))

    # Seed Demo Officer Account: Yash Kumar, Mobile 9761003007, Password yash@specify23
    cursor.execute("SELECT id FROM officers WHERE mobile = ?", ("9761003007",))
    existing_demo = cursor.fetchone()
    if not existing_demo:
        demo_hash, demo_salt = hash_password("yash@specify23")
        cursor.execute("""
            INSERT INTO officers (
                id, name, mobile, email, department, designation, jurisdiction,
                badge_number, password_hash, salt, is_verified, approval_status,
                office_address, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'APPROVED', ?, ?)
        """, (
            DEFAULT_OFFICER["id"],
            "Yash Kumar",
            "9761003007",
            "yash.kumar@pwd.delhi.gov.in",
            DEFAULT_OFFICER["department"],
            DEFAULT_OFFICER["designation"],
            DEFAULT_OFFICER["zone"],
            DEFAULT_OFFICER["badge_number"],
            demo_hash,
            demo_salt,
            DEFAULT_OFFICER["office_address"],
            datetime.now().isoformat()
        ))

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
    prof_id = data.get("id", DEFAULT_OFFICER["id"])
    cursor.execute("INSERT OR REPLACE INTO officer_profile (id, data) VALUES (?, ?)", (prof_id, json.dumps(data)))
    conn.commit()
    conn.close()
    return data

def authenticate_officer(name: str, mobile: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    clean_mobile = mobile.strip().replace(" ", "").replace("-", "")
    if clean_mobile.startswith("+91"):
        clean_mobile = clean_mobile[3:]

    cursor.execute("SELECT * FROM officers WHERE mobile = ? OR mobile = ?", (clean_mobile, mobile.strip()))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    # Check name match (case-insensitive substring or full match)
    officer_name = row["name"].strip().lower()
    input_name = name.strip().lower()
    if input_name != officer_name and input_name not in officer_name and officer_name not in input_name:
        return None

    # Verify password hash
    if not verify_password(password, row["password_hash"], row["salt"]):
        return None

    # Check approval status
    if row["is_verified"] != 1 or row["approval_status"] != "APPROVED":
        return None

    return {
        "id": row["id"],
        "name": row["name"],
        "mobile": row["mobile"],
        "email": row["email"],
        "department": row["department"],
        "designation": row["designation"],
        "jurisdiction": row["jurisdiction"],
        "badgeNumber": row["badge_number"],
        "isVerified": True,
        "approvalStatus": "APPROVED",
        "officeAddress": row["office_address"],
        "createdAt": row["created_at"]
    }

def change_officer_password(officer_id: str, current_password: str, new_password: str) -> Tuple[bool, str]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM officers WHERE id = ?", (officer_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False, "Officer not found."

    if not verify_password(current_password, row["password_hash"], row["salt"]):
        conn.close()
        return False, "Current password does not match official records."

    new_hash, new_salt = hash_password(new_password)
    cursor.execute("UPDATE officers SET password_hash = ?, salt = ? WHERE id = ?", (new_hash, new_salt, officer_id))
    conn.commit()
    conn.close()
    return True, "Password successfully updated."

def register_officer_db(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    clean_mobile = data["mobile"].strip().replace(" ", "").replace("-", "")
    if clean_mobile.startswith("+91"):
        clean_mobile = clean_mobile[3:]

    cursor.execute("SELECT id FROM officers WHERE mobile = ?", (clean_mobile,))
    if cursor.fetchone():
        conn.close()
        raise ValueError("An officer with this mobile number is already registered.")

    p_hash, p_salt = hash_password(data["password"])
    new_id = f"OFF-{clean_mobile[-4:]}"
    auto_approve = data.get("autoApprove", False)
    status_val = "APPROVED" if auto_approve else "PENDING_VERIFICATION"
    verified_val = 1 if auto_approve else 0

    cursor.execute("""
        INSERT INTO officers (
            id, name, mobile, email, department, designation, jurisdiction,
            badge_number, password_hash, salt, is_verified, approval_status,
            office_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id,
        data["name"],
        clean_mobile,
        data.get("email", ""),
        data.get("department", "Public Works Department"),
        data.get("designation", "Assistant Engineer"),
        data.get("jurisdiction", "Zone 1"),
        f"GNIDA-OFF-{clean_mobile[-4:]}",
        p_hash,
        p_salt,
        verified_val,
        status_val,
        data.get("officeAddress", "GNIDA Administrative Complex"),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()

    return {
        "id": new_id,
        "name": data["name"],
        "mobile": clean_mobile,
        "email": data.get("email", ""),
        "department": data.get("department", "Public Works Department"),
        "designation": data.get("designation", "Assistant Engineer"),
        "jurisdiction": data.get("jurisdiction", "Zone 1"),
        "badgeNumber": f"GNIDA-OFF-{clean_mobile[-4:]}",
        "isVerified": auto_approve,
        "approvalStatus": status_val
    }

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

    # Re-seed demo officer
    cursor.execute("DELETE FROM officers WHERE mobile = '9761003007'")
    demo_hash, demo_salt = hash_password("yash@specify23")
    cursor.execute("""
        INSERT INTO officers (
            id, name, mobile, email, department, designation, jurisdiction,
            badge_number, password_hash, salt, is_verified, approval_status,
            office_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'APPROVED', ?, ?)
    """, (
        DEFAULT_OFFICER["id"],
        "Yash Kumar",
        "9761003007",
        "yash.kumar@pwd.delhi.gov.in",
        DEFAULT_OFFICER["department"],
        DEFAULT_OFFICER["designation"],
        DEFAULT_OFFICER["zone"],
        DEFAULT_OFFICER["badge_number"],
        demo_hash,
        demo_salt,
        DEFAULT_OFFICER["office_address"],
        datetime.now().isoformat()
    ))

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
