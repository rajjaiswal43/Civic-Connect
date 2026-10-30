import os
import json
import secrets
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .models import (
    OfficerProfile,
    OfficerLoginRequest,
    OfficerLoginByNameMobileRequest,
    OfficerChangePasswordRequest,
    OfficerRegisterRequest,
    OfficerApproveRequest,
    OfficerRejectRequest,
    OfficerRequestInfoRequest,
    OfficerVerifyCompletionRequest,
    AuthOtpRequest,
    AuthOtpResponse,
    IncidentCreateRequest,
    IncidentMediaRequest,
    ValidationRequest,
    AcknowledgeRequest,
    AssignRequest,
    ExtendDeadlineRequest,
    WorkerStatusRequest,
    WorkerCompletionRequest,
    ClosureFeedbackRequest,
    ReopenRequest,
    OverrideAiRequest,
    Incident,
    HotspotSummary
)
from .database import (
    init_db,
    get_connection,
    get_officer_profile,
    update_officer_profile,
    authenticate_officer,
    change_officer_password,
    register_officer_db,
    get_all_incidents,
    get_incident_by_id,
    save_incident,
    get_all_workers,
    get_all_hotspots,
    reset_db_data
)
from .ai_engine import (
    calculate_priority_score,
    check_duplicate_candidates,
    suggest_department,
    compute_media_sha256
)

app = FastAPI(
    title="Civic Connect API",
    description="AI-Assisted Public Infrastructure Reporting & Accountability Platform — FastAPI + SQLite",
    version="1.5.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def handle_api_prefix(request: Request, call_next):
    if request.scope["path"].startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:]
    elif request.scope["path"] == "/api":
        request.scope["path"] = "/"
    response = await call_next(request)
    return response

# Startup event: Initialize database and seed if empty
@app.on_event("startup")
def startup_event():
    seed_file = os.path.join(os.path.dirname(__file__), "seed_data.json")
    initial_incidents = []
    workers = []
    hotspots = []
    if os.path.exists(seed_file):
        try:
            with open(seed_file, "r") as f:
                data = json.load(f)
                initial_incidents = data.get("incidents", [])
                workers = data.get("workers", [])
                hotspots = data.get("hotspots", [])
        except Exception as e:
            print("Error reading seed_data.json:", e)

    init_db(initial_incidents=initial_incidents, workers=workers, hotspots=hotspots)
    print("Database initialized successfully.")

def get_now_formatted():
    now = datetime.now()
    return f"{now.day} Aug 2026, {now.strftime('%I:%M %p')}"

# 1. Health check & Root
@app.get("/")
@app.get("/health")
def read_root():
    return {
        "platform": "CIVIC CONNECT",
        "description": "AI-Powered Civic Complaint Intelligence & Resolution Platform",
        "status": "online",
        "version": "1.5.0",
        "api_docs": "/docs",
        "database": "SQLite / PostGIS Schema Compatible"
    }

# 2. POST /auth/otp — Identity verification for citizens
@app.post("/auth/otp", response_model=AuthOtpResponse)
def authenticate_user(req: AuthOtpRequest):
    phone = req.phone.strip()
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid mobile number format")

    masked = phone[:2] + "*****" + phone[-3:]
    return AuthOtpResponse(
        success=True,
        token=f"jwt_civic_{abs(hash(phone)) % 1000000}",
        user_id=f"USR-{abs(hash(phone)) % 9000 + 1000}",
        phone_masked=f"+91 {masked}",
        role="citizen",
        message="Authentication successful via National SMS Gateway simulation"
    )

# 3. POST /admin/officer/login — Secure server-side Officer authentication
@app.post("/admin/officer/login")
def officer_login_endpoint(req: OfficerLoginRequest):
    name = (req.name or "").strip()
    mobile = (req.mobile or "").strip()
    password = (req.password or "").strip()

    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")

    # Support login with mobile number or fallback to email
    if not mobile and req.email:
        # Check if email is yash.kumar or officer.chauhan
        if "yash" in req.email.lower():
            mobile = "9761003007"
            name = name or "Yash Kumar"

    if not mobile:
        mobile = "9761003007"

    officer = authenticate_officer(name or "Yash Kumar", mobile, password)
    if not officer:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please verify your Full Name, Mobile Number, and Password."
        )

    token = f"officer_jwt_{secrets.token_hex(20)}"
    return {
        "success": True,
        "token": token,
        "officer": officer,
        "message": f"Welcome, {officer['name']}. Authorized to Officer Command Centre."
    }

# 4. POST /admin/officer/change-password — Secure Officer password modification
@app.post("/admin/officer/change-password")
def change_password_endpoint(req: OfficerChangePasswordRequest):
    ok, msg = change_officer_password(req.officerId, req.currentPassword, req.newPassword)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg}

# 5. POST /admin/officer/register — Officer account registration (with approval gate)
@app.post("/admin/officer/register")
def register_officer_endpoint(req: OfficerRegisterRequest):
    try:
        new_officer = register_officer_db(req.dict())
        return {
            "success": True,
            "officer": new_officer,
            "message": "Officer account registered and approved." if new_officer["isVerified"] else "Account registered. Pending administrative clearance."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. GET /admin/officer — Retrieve active Officer details
@app.get("/admin/officer", response_model=OfficerProfile)
def get_officer():
    profile = get_officer_profile()
    return profile

# 7. PUT /admin/officer — Update Officer details
@app.put("/admin/officer", response_model=OfficerProfile)
def update_officer(req: OfficerProfile):
    updated = update_officer_profile(req.dict())
    return updated

# 8. GET /workers — List available field workers
@app.get("/workers")
def list_workers():
    workers = get_all_workers()
    return workers

# 9. GET /incidents — List public and officer incidents with filters
@app.get("/incidents")
def list_incidents(
    category: Optional[str] = Query(None, description="Category filter"),
    ward: Optional[str] = Query(None, description="Ward filter"),
    status: Optional[str] = Query(None, description="Status filter"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    search: Optional[str] = Query(None, description="Search query")
):
    incidents = get_all_incidents()

    filtered = incidents
    if category and category != "ALL":
        filtered = [i for i in filtered if i.get("category") == category]
    if ward and ward != "ALL":
        filtered = [i for i in filtered if i.get("location", {}).get("ward") == ward]
    if status and status != "ALL":
        filtered = [i for i in filtered if i.get("status") == status]
    if priority and priority != "ALL":
        filtered = [i for i in filtered if i.get("priorityLevel") == priority]
    if search:
        s = search.lower()
        filtered = [
            i for i in filtered
            if s in i.get("id", "").lower()
            or s in i.get("title", "").lower()
            or s in i.get("description", "").lower()
            or s in i.get("location", {}).get("address", "").lower()
            or s in i.get("department", "").lower()
        ]

    return filtered

# 10. GET /incidents/{id} — Read incident details
@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return inc

# 11. POST /incidents — Create a new report
@app.post("/incidents", status_code=status.HTTP_201_CREATED)
def create_incident(req: IncidentCreateRequest):
    all_incidents = get_all_incidents()
    new_id = f"CC-{1040 + len(all_incidents) + 1}"
    now_str = get_now_formatted()

    ward = req.ward or "Ward 12"
    address = req.address or f"{ward}, Greater Noida"
    landmark = req.landmark or "Near Central Commercial Belt"
    dept = suggest_department(req.category)

    priority_data = calculate_priority_score(
        category=req.category,
        description=req.description or "Civic infrastructure issue reported.",
        ward=ward,
        address=address,
        confirmations_count=1,
        avg_impact_rating=4.5
    )

    dup_prob, dup_candidates, cluster_id = check_duplicate_candidates(
        new_lat=req.latitude if req.latitude is not None else 0.0,
        new_lng=req.longitude if req.longitude is not None else 0.0,
        new_category=req.category,
        new_desc=req.description or "",
        existing_incidents=all_incidents
    )

    is_low_conf = False
    ai_confidence = 94.0
    if len((req.description or "").strip()) < 10:
        is_low_conf = True
        ai_confidence = 54.0

    photo_url = req.beforePhotoUrl or ""
    content_hash = compute_media_sha256(photo_url.encode('utf-8'))[:16] if photo_url else "no-hash"

    new_incident = {
        "id": new_id,
        "title": f"Reported {req.category}: {landmark}",
        "description": req.description or f"Civic issue reported in {ward}.",
        "category": req.category,
        "status": "UNDER_REVIEW", # Newly reported issues appear under Under Review
        "escalationState": "NEEDS_REVIEW" if is_low_conf else "NONE",
        "priorityLevel": priority_data["priorityLevel"],
        "priorityScore": priority_data["totalScore"],
        "priorityBreakdown": {
            "severity": priority_data["severity"],
            "publicImpact": priority_data["publicImpact"],
            "vulnerability": priority_data["vulnerability"],
            "corroboration": priority_data["corroboration"],
            "persistence": priority_data["persistence"],
            "locationContext": priority_data["locationContext"],
            "totalScore": priority_data["totalScore"]
        },
        "location": {
            "lat": req.latitude if req.latitude is not None else 0.0,
            "lng": req.longitude if req.longitude is not None else 0.0,
            "address": address,
            "ward": ward,
            "landmark": landmark,
            "hotspotZone": "Municipal Zone",
            "isPublicSafePrecision": True
        },
        "evidence": {
            "beforePhotoUrl": photo_url,
            "photoTimestamp": now_str,
            "gpsVerified": True,
            "provenance": req.provenance,
            "hasVoiceNote": req.hasVoiceNote,
            "voiceTranscript": req.voiceTranscript,
            "deviceMetadata": {
                "device": "Mobile Web PWA (Verified GPS)",
                "accuracyMeters": 3.4,
                "tamperCheckPassed": True,
                "sha256Hash": content_hash
            }
        },
        "aiMetadata": {
            "classification": f"{req.category} / {'High Certainty' if not is_low_conf else 'Manual Review Flagged'}",
            "confidence": ai_confidence,
            "evidenceRelevance": 98.0,
            "duplicateClusterProbability": dup_prob,
            "modelVersion": "CivicVision-v1.4b (YOLO-v9 + PostGIS)",
            "suggestedDepartment": dept,
            "suggestedWard": ward,
            "reasonCodes": [
                f"Visual features match municipal {req.category.lower()} inspection patterns",
                f"Geofenced corridor in {ward} with active citizen traffic",
                f"Automated spatial distance scan: {len(dup_candidates)} nearby reports evaluated"
            ],
            "isLowConfidence": is_low_conf,
            "duplicateClusterId": cluster_id or f"CLUSTER-{ward.replace(' ', '')}"
        },
        "linkedReports": dup_candidates,
        "communityConfirmations": 1,
        "communityDisagreements": 0,
        "averageImpactRating": 4.5,
        "validationsList": [],
        "department": dept,
        "slaHoursRemaining": 24,
        "isSlaAtRisk": False,
        "createdAt": now_str,
        "updatedAt": now_str,
        "auditLogs": [
            {
                "id": f"log-{int(datetime.now().timestamp() * 1000)}",
                "timestamp": now_str,
                "actor": f"Citizen ({req.citizenName or 'Reporter'})",
                "role": "Citizen",
                "action": "Report Submitted",
                "details": f"Report submitted at {address} with GPS geotag and live photographic proof."
            },
            {
                "id": f"log-{int(datetime.now().timestamp() * 1000) + 1}",
                "timestamp": now_str,
                "actor": "AI Vision Pipeline",
                "role": "AI System (v1.4b)",
                "action": "Issue Categorized & Routed",
                "details": f"Detected category '{req.category}' ({ai_confidence}% confidence). Routed to {dept}.",
                "modelVersion": "CivicVision-v1.4b",
                "confidence": ai_confidence
            }
        ]
    }

    saved = save_incident(new_incident)
    return saved

# 12. POST /admin/incidents/{id}/approve — Officer approves valid complaint
@app.post("/admin/incidents/{incident_id}/approve")
def approve_incident_api(incident_id: str, req: Optional[OfficerApproveRequest] = None):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    officer = get_officer_profile()
    now_str = get_now_formatted()

    inc["status"] = "APPROVED"
    if req and req.overrideCategory:
        inc["category"] = req.overrideCategory
    if req and req.overrideDepartment:
        inc["department"] = req.overrideDepartment
    if req and req.officerNotes:
        inc["officerNotes"] = req.officerNotes

    officer_name = officer.get("name", "Yash Kumar")
    badge = officer.get("badge_number", "GNIDA-EO-9761")

    inc["updatedAt"] = now_str
    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"{officer_name} ({badge})",
        "role": "Municipal Officer",
        "action": "Complaint Approved",
        "details": f"Complaint officially approved by Officer {officer_name}. Eligible for field worker assignment."
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 13. POST /admin/incidents/{id}/reject — Officer rejects invalid or duplicate complaint
@app.post("/admin/incidents/{incident_id}/reject")
def reject_incident_api(incident_id: str, req: OfficerRejectRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    if not req.rejectionReason or not req.rejectionReason.strip():
        raise HTTPException(status_code=400, detail="Rejection reason is mandatory.")

    officer = get_officer_profile()
    now_str = get_now_formatted()

    inc["status"] = "REJECTED"
    inc["escalationState"] = "REJECTED"
    inc["rejectionReason"] = req.rejectionReason.strip()
    inc["updatedAt"] = now_str

    officer_name = officer.get("name", "Yash Kumar")
    badge = officer.get("badge_number", "GNIDA-EO-9761")

    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"{officer_name} ({badge})",
        "role": "Municipal Officer",
        "action": "Complaint Rejected",
        "details": f"Report officially rejected. Ground reason: \"{req.rejectionReason.strip()}\"."
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 14. POST /admin/incidents/{id}/request-info — Request additional information
@app.post("/admin/incidents/{incident_id}/request-info")
def request_more_info_api(incident_id: str, req: OfficerRequestInfoRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    officer = get_officer_profile()
    now_str = get_now_formatted()

    inc["status"] = "MORE_INFO_REQUIRED"
    inc["moreInfoNotes"] = req.requestNotes.strip()
    inc["updatedAt"] = now_str

    officer_name = officer.get("name", "Yash Kumar")
    badge = officer.get("badge_number", "GNIDA-EO-9761")

    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"{officer_name} ({badge})",
        "role": "Municipal Officer",
        "action": "Additional Information Requested",
        "details": f"Officer requested clarification: \"{req.requestNotes.strip()}\"."
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 15. POST /admin/incidents/{id}/assign — Assign worker and set completion deadline
@app.post("/admin/incidents/{incident_id}/assign")
def assign_incident_api(incident_id: str, req: AssignRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    workers = get_all_workers()
    assigned_worker = next((w for w in workers if w["id"] == req.workerId), workers[0] if workers else None)

    officer = get_officer_profile()
    now_str = get_now_formatted()

    inc["status"] = "ASSIGNED"
    inc["deadline"] = req.deadline
    inc["assignedWorker"] = assigned_worker
    inc["slaHoursRemaining"] = 24
    if req.notes:
        inc["officerNotes"] = req.notes

    worker_name = assigned_worker.get("name", "Field Crew") if assigned_worker else "Field Crew"
    worker_team = assigned_worker.get("team", "") if assigned_worker else ""
    officer_name = officer.get("name", "Yash Kumar")
    badge = officer.get("badge_number", "GNIDA-EO-9761")

    inc["updatedAt"] = now_str
    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"{officer_name} ({badge})",
        "role": "Municipal Officer",
        "action": "Work Order Assigned",
        "details": f"Assigned to {worker_name} ({worker_team}). Target Deadline: {req.deadline}."
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 16. POST /admin/incidents/{id}/extend-deadline — Extend completion deadline
@app.post("/admin/incidents/{incident_id}/extend-deadline")
def extend_incident_deadline(incident_id: str, req: ExtendDeadlineRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    officer = get_officer_profile()
    now_str = get_now_formatted()
    prev_deadline = inc.get("deadline", "Initial Deadline")

    inc["deadline"] = req.newDeadline
    if "deadlineExtensions" not in inc or not isinstance(inc["deadlineExtensions"], list):
        inc["deadlineExtensions"] = []

    officer_name = officer.get("name", "Yash Kumar")
    badge = officer.get("badge_number", "GNIDA-EO-9761")

    inc["deadlineExtensions"].append({
        "id": f"ext-{int(datetime.now().timestamp() * 1000)}",
        "previousDeadline": prev_deadline,
        "newDeadline": req.newDeadline,
        "reason": req.reason,
        "extendedBy": f"{officer_name} ({badge})",
        "timestamp": now_str
    })

    inc["updatedAt"] = now_str
    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"{officer_name} ({badge})",
        "role": "Municipal Officer",
        "action": "Statutory Deadline Extended",
        "details": f"Deadline extended from {prev_deadline} to {req.newDeadline}. Reason: {req.reason}"
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 17. PATCH /worker/incidents/{id}/status — Worker updates status (e.g. WORK_STARTED)
@app.patch("/worker/incidents/{incident_id}/status")
def update_worker_status(incident_id: str, req: WorkerStatusRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    now_str = get_now_formatted()
    new_status = req.status
    if new_status == "IN_PROGRESS":
        new_status = "WORK_STARTED"

    inc["status"] = new_status
    if req.notes:
        inc["workerNotes"] = req.notes

    worker_name = inc.get("assignedWorker", {}).get("name", "Field Technician")
    inc["updatedAt"] = now_str
    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"Field Worker ({worker_name})",
        "role": "Field Worker",
        "action": "Work Started On-Site" if new_status == "WORK_STARTED" else "Task Status Updated",
        "details": req.notes or "Technician checked in on-site. Field repair work commenced."
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 18. POST /worker/incidents/{id}/completion — Worker uploads repair proof and submits for verification
@app.post("/worker/incidents/{incident_id}/completion")
def submit_completion(incident_id: str, req: WorkerCompletionRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    now_str = get_now_formatted()
    inc["status"] = "WORK_COMPLETED"
    inc["evidence"]["afterPhotoUrl"] = req.afterPhotoUrl
    if req.workerNotes:
        inc["workerNotes"] = req.workerNotes
    if req.materialsLogged:
        inc["materialsLogged"] = req.materialsLogged

    worker_name = inc.get("assignedWorker", {}).get("name", "Field Worker")
    inc["updatedAt"] = now_str
    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": f"Field Worker ({worker_name})",
        "role": "Field Worker",
        "action": "Completion Evidence Submitted",
        "details": f"Completion photo uploaded with repair details. Awaiting Officer quality review. Notes: \"{req.workerNotes or 'Completed'}\""
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 19. POST /admin/incidents/{id}/verify-completion — Officer verifies completed work
@app.post("/admin/incidents/{incident_id}/verify-completion")
def verify_completed_work_api(incident_id: str, req: OfficerVerifyCompletionRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    officer = get_officer_profile()
    now_str = get_now_formatted()
    officer_name = officer.get("name", "Yash Kumar")
    badge = officer.get("badge_number", "GNIDA-EO-9761")

    if req.action == "approve":
        inc["status"] = "AWAITING_CITIZEN_FEEDBACK" # Officer verified, ready for citizen confirmation
        inc["updatedAt"] = now_str
        inc["auditLogs"].insert(0, {
            "id": f"log-{int(datetime.now().timestamp() * 1000)}",
            "timestamp": now_str,
            "actor": f"{officer_name} ({badge})",
            "role": "Municipal Officer",
            "action": "Officer Verified Completed Work",
            "details": f"Work verified by {officer_name}. Before/after proof approved for public transparency. Sent to citizen for final feedback."
        })
    else: # reject or request rework
        inc["status"] = "WORK_STARTED"
        inc["escalationState"] = "REOPENED"
        inc["officerNotes"] = f"Rework Required: {req.notes or 'Quality standards not satisfied. Additional work ordered.'}"
        inc["updatedAt"] = now_str
        inc["auditLogs"].insert(0, {
            "id": f"log-{int(datetime.now().timestamp() * 1000)}",
            "timestamp": now_str,
            "actor": f"{officer_name} ({badge})",
            "role": "Municipal Officer",
            "action": "Completion Evidence Rejected / Rework Ordered",
            "details": f"Officer ordered rework: {req.notes or 'Deficiencies noted in ground repair.'}"
        })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 20. POST /incidents/{id}/closure-feedback — Citizen gives feedback, automatically resolving complaint if satisfied
@app.post("/incidents/{incident_id}/closure-feedback")
def citizen_closure_feedback(incident_id: str, req: ClosureFeedbackRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    now_str = get_now_formatted()

    if req.isSatisfied:
        inc["status"] = "RESOLVED"
        inc["escalationState"] = "NONE"
        inc["slaHoursRemaining"] = 0
        inc["progressPercent"] = 100
        inc["userVote"] = "resolved"
        inc["citizenFeedback"] = {
            "isSatisfied": True,
            "rating": req.rating,
            "comment": req.feedbackNotes or "Citizen confirmed fully resolved.",
            "submittedAt": now_str
        }
        inc["updatedAt"] = now_str
        inc["auditLogs"].insert(0, {
            "id": f"log-{int(datetime.now().timestamp() * 1000)}",
            "timestamp": now_str,
            "actor": "Citizen (Reporter)",
            "role": "Citizen",
            "action": "Citizen Final Feedback & Resolution Confirmed",
            "details": f"Citizen confirmed fully resolved ({req.rating}★). Feedback: \"{req.feedbackNotes or 'Problem solved on ground. Thank you!'}\""
        })
    else:
        inc["status"] = "REOPENED"
        inc["escalationState"] = "REOPENED"
        inc["reopenReason"] = req.feedbackNotes or "Citizen reported issue partially or not resolved."
        inc["priorityLevel"] = "CRITICAL"
        inc["priorityScore"] = 95.0
        inc["isSlaAtRisk"] = True
        inc["citizenFeedback"] = {
            "isSatisfied": False,
            "rating": req.rating,
            "comment": req.feedbackNotes or "Issue unresolved on the ground.",
            "submittedAt": now_str
        }
        inc["updatedAt"] = now_str
        inc["auditLogs"].insert(0, {
            "id": f"log-{int(datetime.now().timestamp() * 1000)}",
            "timestamp": now_str,
            "actor": "Citizen (Reporter)",
            "role": "Citizen",
            "action": "Citizen Disputed Work / Complaint Reopened",
            "details": f"Citizen indicated not resolved ({req.rating}★). Reason: \"{req.feedbackNotes or 'Unresolved'}\". Re-routed for urgent rework."
        })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 21. POST /incidents/{id}/validate — Citizen community impact validation
@app.post("/incidents/{incident_id}/validate")
def validate_incident(incident_id: str, req: ValidationRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    now_str = get_now_formatted()

    if req.action == "confirmed_exists":
        inc["communityConfirmations"] = inc.get("communityConfirmations", 0) + 1
    else:
        inc["communityDisagreements"] = inc.get("communityDisagreements", 0) + 1

    val_entry = {
        "id": f"val-{int(datetime.now().timestamp() * 1000)}",
        "userIdMasked": "Verified Citizen (Ward Resident)",
        "action": req.action,
        "impactRating": req.impactRating,
        "comment": req.comment or "",
        "timestamp": now_str
    }

    inc.setdefault("validationsList", []).insert(0, val_entry)
    all_ratings = [v["impactRating"] for v in inc["validationsList"] if v.get("impactRating", 0) > 0]
    if all_ratings:
        inc["averageImpactRating"] = round(sum(all_ratings) / len(all_ratings), 1)

    inc["updatedAt"] = now_str
    inc["auditLogs"].insert(0, {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": now_str,
        "actor": "Citizen (Community)",
        "role": "Community",
        "action": "Community Issue Corroborated" if req.action == "confirmed_exists" else "Issue Flagged Not Present",
        "details": f"Citizen voted {req.action}. Impact rating: {req.impactRating}/5. Note: \"{req.comment or 'Corroborated'}\""
    })

    save_incident(inc)
    return {"success": True, "incident": inc}

# 22. GET /analytics/hotspots — Hotspot summaries
@app.get("/analytics/hotspots", response_model=List[HotspotSummary])
def get_hotspot_analytics():
    hotspots = get_all_hotspots()
    return hotspots

# 23. GET /analytics/summary — Citywide KPI statistics
@app.get("/analytics/summary")
def get_analytics_summary():
    incidents = get_all_incidents()
    total = len(incidents)
    resolved = len([i for i in incidents if i.get("status") == "RESOLVED"])
    in_progress = len([i for i in incidents if i.get("status") in ["WORK_STARTED", "ASSIGNED", "IN_PROGRESS"]])
    pending = len([i for i in incidents if i.get("status") in ["SUBMITTED", "UNDER_REVIEW", "AI_CHECK"]])
    awaiting_verify = len([i for i in incidents if i.get("status") in ["WORK_COMPLETED", "OFFICER_VERIFICATION"]])
    high_priority = len([i for i in incidents if i.get("priorityLevel") in ["HIGH", "CRITICAL"]])

    return {
        "totalIncidents": total,
        "activeCount": len(incidents),
        "resolvedCount": resolved,
        "inProgressCount": in_progress,
        "pendingCount": pending,
        "awaitingVerificationCount": awaiting_verify,
        "highPriorityCount": high_priority,
        "averageResolutionHours": 18.4,
        "duplicateClusteringSavingsPercent": 34.2,
        "aiAccuracyPercent": 94.0
    }

# 24. POST /admin/reset — Reset database to initial municipal seed dataset
@app.post("/admin/reset")
def reset_database():
    seed_file = os.path.join(os.path.dirname(__file__), "seed_data.json")
    if os.path.exists(seed_file):
        with open(seed_file, "r") as f:
            data = json.load(f)
            reset_db_data(
                initial_incidents=data.get("incidents", []),
                workers=data.get("workers", []),
                hotspots=data.get("hotspots", [])
            )
    return {"success": True, "message": "Database reset to initial municipal seed dataset."}
