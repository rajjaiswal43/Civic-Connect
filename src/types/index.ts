export type IncidentCategory =
  | 'Pothole'
  | 'Streetlight'
  | 'Garbage'
  | 'Water Leakage'
  | 'Drainage'
  | 'Footpath'
  | 'Open Manhole'
  | 'Traffic Sign'
  | 'Public Asset'
  | 'Other';

// Recommended Lifecycle Stages (Section 7)
export type IncidentStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'OFFICER_VERIFICATION'
  | 'AWAITING_CITIZEN_FEEDBACK'
  | 'RESOLVED'
  // Auxiliary States
  | 'REJECTED'
  | 'MORE_INFO_REQUIRED'
  | 'REOPENED'
  | 'OVERDUE'
  // Backward-compatibility Aliases
  | 'AI_CHECK'
  | 'VERIFIED'
  | 'PUBLIC'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'PUBLIC_VERIFY';

// Escalation States
export type EscalationState =
  | 'NONE'
  | 'NEEDS_REVIEW'
  | 'DUPLICATE_LINKED'
  | 'OVERDUE'
  | 'REOPENED'
  | 'REJECTED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PriorityBreakdown {
  severity: number; // Max 30
  publicImpact: number; // Max 20
  vulnerability: number; // Max 15
  corroboration: number; // Max 15
  persistence: number; // Max 10
  locationContext: number; // Max 10
  totalScore: number; // 0 - 100
}

export type ProvenanceType = 'live_camera' | 'gallery_upload';

export interface LinkedCitizenReport {
  id: string;
  reporterMasked: string;
  distanceMeters: number;
  reportedAgo: string;
  photoUrl: string;
  description: string;
  timestamp: string;
  provenance: ProvenanceType;
}

export interface PublicValidationEntry {
  id: string;
  userIdMasked: string;
  action: 'confirmed_exists' | 'not_present_wrong_location';
  impactRating: number; // 1 to 5
  comment?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: 'Citizen' | 'Municipal Officer' | 'Field Worker' | 'AI System (v1.4b)' | 'Community' | 'System';
  action: string;
  details: string;
  modelVersion?: string;
  confidence?: number;
  overrideReason?: string;
  sha256Hash?: string;
}

export interface OfficerProfile {
  id: string;
  name: string;
  designation: string;
  badge_number: string;
  department: string;
  zone: string;
  phone: string;
  email: string;
  office_address: string;
  jurisdiction_wards: string[];
  shift_status: string;
  last_login: string;
}

export interface OfficerAccount {
  id: string;
  name: string;
  mobile: string;
  email: string;
  department: string;
  designation: string;
  jurisdiction: string;
  badgeNumber: string;
  passwordHash?: string;
  isVerified: boolean;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  officeAddress?: string;
}

export interface WorkerInfo {
  id: string;
  name: string;
  role: string;
  phone: string;
  department: string;
  team: string;
  avatarUrl?: string;
  currentTasksCount: number;
  equipment: string[];
}

export interface DeadlineExtension {
  id: string;
  previousDeadline: string;
  newDeadline: string;
  reason: string;
  extendedBy: string;
  timestamp: string;
}

export interface CivicIncident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  escalationState: EscalationState;
  priorityLevel: PriorityLevel;
  priorityScore: number; // 0-100
  priorityBreakdown: PriorityBreakdown;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
    landmark: string;
    hotspotZone?: string;
    isPublicSafePrecision?: boolean;
    accuracyMeters?: number;
    source?: 'exif_gps' | 'device_gps' | 'manual_pin';
  };
  evidence: {
    beforePhotoUrl: string;
    afterPhotoUrl?: string;
    photoTimestamp: string;
    gpsVerified: boolean;
    provenance: ProvenanceType;
    hasVoiceNote?: boolean;
    voiceTranscript?: string;
    deviceMetadata?: {
      device: string;
      accuracyMeters: number;
      tamperCheckPassed: boolean;
      sha256Hash: string;
    };
  };
  aiMetadata: {
    classification: string;
    confidence: number;
    evidenceRelevance: number;
    duplicateClusterProbability: number;
    modelVersion: string;
    suggestedDepartment: string;
    suggestedWard: string;
    reasonCodes: string[];
    isLowConfidence?: boolean;
    duplicateClusterId?: string;
  };
  linkedReports: LinkedCitizenReport[];
  communityConfirmations: number;
  communityDisagreements: number;
  averageImpactRating: number; // 1-5
  validationsList: PublicValidationEntry[];
  userVote?: 'confirmed' | 'disputed' | 'resolved';
  isFollowing?: boolean;
  department: string;
  assignedWorker?: WorkerInfo;
  deadline?: string;
  deadlineTimestamp?: number; // Epoch ms for exact countdown
  deadlineExtensions?: DeadlineExtension[];
  progressPercent?: number; // 0 to 100
  slaHoursRemaining: number;
  isSlaAtRisk?: boolean;
  officerNotes?: string;
  workerNotes?: string;
  materialsLogged?: string;
  reopenReason?: string;
  rejectionReason?: string;
  moreInfoNotes?: string;
  citizenFeedback?: {
    isSatisfied: boolean;
    rating: number; // 1-5
    comment?: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  auditLogs: AuditLogEntry[];
}

export type UserRole = 'citizen' | 'officer' | 'worker';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  incidentId: string;
  type: 'verified' | 'assigned' | 'proof_submitted' | 'resolved' | 'reopened' | 'sla_warning' | 'community_vote' | 'officer_review' | 'deadline_alert';
}

export interface HotspotCluster {
  id: string;
  name: string;
  ward: string;
  category: IncidentCategory;
  incidentCount: number;
  recurrenceScore: string;
  riskLevel: 'MODERATE' | 'HIGH' | 'CRITICAL';
  suggestedCapitalWork: string;
  estimatedBudget: string;
  coordinates: [number, number];
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT';
  path: string;
  purpose: string;
  authRequired: string;
  sampleRequest?: Record<string, any>;
  sampleResponse: Record<string, any>;
}

export interface DbTableSpec {
  tableName: string;
  description: string;
  columns: { name: string; type: string; constraints: string; description: string }[];
}
