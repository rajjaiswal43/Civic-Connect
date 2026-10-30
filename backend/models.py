from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

# Core Types matching Antigravity Master Specification
IncidentCategory = Literal[
    'Pothole',
    'Streetlight',
    'Garbage',
    'Water Leakage',
    'Drainage',
    'Footpath',
    'Open Manhole',
    'Traffic Sign',
    'Public Asset',
    'Other'
]

IncidentStatus = Literal[
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'ASSIGNED',
    'WORK_STARTED',
    'WORK_COMPLETED',
    'OFFICER_VERIFICATION',
    'AWAITING_CITIZEN_FEEDBACK',
    'RESOLVED',
    'REJECTED',
    'MORE_INFO_REQUIRED',
    'REOPENED',
    'OVERDUE',
    # Legacy aliases
    'AI_CHECK',
    'VERIFIED',
    'PUBLIC',
    'ACKNOWLEDGED',
    'IN_PROGRESS',
    'PUBLIC_VERIFY'
]

EscalationState = Literal[
    'NONE',
    'NEEDS_REVIEW',
    'DUPLICATE_LINKED',
    'OVERDUE',
    'REOPENED',
    'REJECTED'
]

PriorityLevel = Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

class OfficerProfile(BaseModel):
    id: str = "OFF-402"
    name: str = "Er. R. B. Chauhan"
    designation: str = "Executive Engineer & Zonal Officer"
    badge_number: str = "GNIDA-EE-2024-042"
    department: str = "Roads & Public Works Department"
    zone: str = "Zone 1 (Wards 1–15), Greater Noida"
    phone: str = "+91 120 232-6000"
    email: str = "officer.chauhan@gnida.in"
    office_address: str = "GNIDA Administrative Complex, Sector Knowledge Park IV, Greater Noida"
    jurisdiction_wards: List[str] = [
        "Ward 1 (Alpha I & II)",
        "Ward 2 (Beta I & II)",
        "Ward 3 (Gamma I & II)",
        "Ward 4 (Delta I & II)",
        "Ward 12 (Knowledge Park III)",
        "Ward 14 (Pari Chowk Junction)"
    ]
    shift_status: str = "Active On Duty — Zonal Triage Command"
    last_login: str = "Just now"

class PriorityBreakdown(BaseModel):
    severity: float = 25.0
    publicImpact: float = 18.0
    vulnerability: float = 14.0
    corroboration: float = 12.0
    persistence: float = 7.0
    locationContext: float = 8.0
    totalScore: float = 84.0

class LocationInfo(BaseModel):
    lat: float
    lng: float
    address: str
    ward: str
    landmark: str
    hotspotZone: Optional[str] = None
    isPublicSafePrecision: bool = True
    accuracyMeters: Optional[float] = 3.5
    source: Optional[str] = "device_gps"

class DeviceMetadata(BaseModel):
    device: str = "Mobile Web PWA (Verified GPS)"
    accuracyMeters: float = 3.5
    tamperCheckPassed: bool = True
    sha256Hash: str = "a1b2c3d4e5f6..."

class EvidenceInfo(BaseModel):
    beforePhotoUrl: str
    afterPhotoUrl: Optional[str] = None
    photoTimestamp: str
    gpsVerified: bool = True
    provenance: str = "live_camera"
    hasVoiceNote: bool = False
    voiceTranscript: Optional[str] = None
    deviceMetadata: Optional[DeviceMetadata] = None

class AIMetadata(BaseModel):
    classification: str
    confidence: float
    evidenceRelevance: float
    duplicateClusterProbability: float
    modelVersion: str = "CivicVision-v1.4b (YOLO-v9 + PostGIS)"
    suggestedDepartment: str
    suggestedWard: str
    reasonCodes: List[str] = []
    isLowConfidence: bool = False
    duplicateClusterId: Optional[str] = None

class LinkedReport(BaseModel):
    id: str
    reporterMasked: str
    distanceMeters: float
    reportedAgo: str
    photoUrl: str
    description: str
    timestamp: str
    provenance: str = "live_camera"

class PublicValidation(BaseModel):
    id: str
    userIdMasked: str
    action: str
    impactRating: int
    comment: Optional[str] = None
    timestamp: str

class AuditLog(BaseModel):
    id: str
    timestamp: str
    actor: str
    role: str
    action: str
    details: str
    modelVersion: Optional[str] = None
    confidence: Optional[float] = None
    overrideReason: Optional[str] = None
    sha256Hash: Optional[str] = None

class WorkerInfo(BaseModel):
    id: str
    name: str
    role: str
    phone: str
    department: str
    team: str
    avatarUrl: Optional[str] = None
    currentTasksCount: int = 1
    equipment: List[str] = []

class DeadlineExtension(BaseModel):
    id: str
    previousDeadline: str
    newDeadline: str
    reason: str
    extendedBy: str
    timestamp: str

class IncidentDetail(BaseModel):
    id: str
    title: str
    description: str
    category: IncidentCategory
    status: IncidentStatus
    escalationState: EscalationState = "NONE"
    priorityLevel: PriorityLevel = "HIGH"
    priorityScore: float = 80.0
    priorityBreakdown: PriorityBreakdown
    location: LocationInfo
    evidence: EvidenceInfo
    aiMetadata: AIMetadata
    linkedReports: List[LinkedReport] = []
    communityConfirmations: int = 1
    communityDisagreements: int = 0
    averageImpactRating: float = 4.5
    validationsList: List[PublicValidation] = []
    department: str = "Roads & Public Works Department"
    assignedWorker: Optional[WorkerInfo] = None
    deadline: Optional[str] = None
    deadlineTimestamp: Optional[int] = None
    deadlineExtensions: Optional[List[DeadlineExtension]] = []
    progressPercent: Optional[int] = 10
    slaHoursRemaining: int = 48
    isSlaAtRisk: bool = False
    officerNotes: Optional[str] = None
    workerNotes: Optional[str] = None
    materialsLogged: Optional[str] = None
    reopenReason: Optional[str] = None
    rejectionReason: Optional[str] = None
    createdAt: str
    updatedAt: str
    auditLogs: List[AuditLog] = []

# API Request Models
class AuthOtpRequest(BaseModel):
    phone: str
    otp: Optional[str] = None

class AuthOtpResponse(BaseModel):
    success: bool
    token: str
    user_id: str
    phone_masked: str
    role: str = "citizen"

class OfficerRegisterRequest(BaseModel):
    name: str
    mobile: str
    email: str
    department: str
    designation: str
    jurisdiction: str
    password: str
    autoApprove: bool = True

class OfficerLoginRequest(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    password: str
    rememberMe: Optional[bool] = False

class OfficerLoginByNameMobileRequest(BaseModel):
    name: str
    mobile: str
    password: str
    rememberMe: Optional[bool] = False

class OfficerChangePasswordRequest(BaseModel):
    officerId: str
    currentPassword: str
    newPassword: str

class OfficerApproveRequest(BaseModel):
    officerNotes: Optional[str] = "Approved after municipal field verification."
    overrideCategory: Optional[str] = None
    overrideDepartment: Optional[str] = None

class OfficerRejectRequest(BaseModel):
    rejectionReason: str

class OfficerRequestInfoRequest(BaseModel):
    requestNotes: str

class OfficerVerifyCompletionRequest(BaseModel):
    action: Literal['approve', 'reject', 'request_rework'] = 'approve'
    notes: Optional[str] = None
    isPublicSafe: Optional[bool] = True

class CreateIncidentRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: IncidentCategory = "Pothole"
    ward: Optional[str] = "Ward 12"
    address: Optional[str] = None
    latitude: Optional[float] = 28.4632
    longitude: Optional[float] = 77.4912
    landmark: Optional[str] = None
    beforePhotoUrl: Optional[str] = None
    provenance: str = "live_camera"
    hasVoiceNote: bool = False
    voiceTranscript: Optional[str] = None
    citizenName: Optional[str] = "Citizen Reporter"
    citizenPhone: Optional[str] = "9876543210"

class ValidationRequest(BaseModel):
    action: Literal['confirmed_exists', 'not_present_wrong_location']
    impactRating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class AcknowledgeRequest(BaseModel):
    deadline: str
    officerNotes: Optional[str] = None
    overrideDepartment: Optional[str] = None

class AssignRequest(BaseModel):
    workerId: str
    deadline: str
    notes: Optional[str] = None

class ExtendDeadlineRequest(BaseModel):
    newDeadline: str
    reason: str

class WorkerStatusRequest(BaseModel):
    status: Literal['IN_PROGRESS', 'ASSIGNED', 'WORK_STARTED']
    notes: Optional[str] = None

class WorkerCompletionRequest(BaseModel):
    afterPhotoUrl: str
    workerNotes: Optional[str] = None
    materialsLogged: Optional[str] = None

class ClosureFeedbackRequest(BaseModel):
    isSatisfied: bool
    rating: int = 5
    feedbackNotes: Optional[str] = None

class ReopenRequest(BaseModel):
    reason: str
    actorRole: Literal['Citizen', 'Municipal Officer'] = 'Citizen'

class OverrideAiRequest(BaseModel):
    category: Optional[IncidentCategory] = None
    priorityLevel: Optional[PriorityLevel] = None
    priorityScore: Optional[float] = None
    department: Optional[str] = None
    reason: str

class HotspotSummary(BaseModel):
    id: str
    name: str
    ward: str
    category: str
    incidentCount: int
    recurrenceScore: str
    riskLevel: str
    suggestedCapitalWork: str
    estimatedBudget: str
    coordinates: List[float]

class IncidentMediaRequest(BaseModel):
    photoUrl: str
    photoType: Literal['before', 'after'] = 'before'
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None

IncidentCreateRequest = CreateIncidentRequest
Incident = IncidentDetail
