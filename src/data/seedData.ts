import {
  CivicIncident,
  WorkerInfo,
  HotspotCluster,
  NotificationItem,
  ApiEndpointSpec,
  DbTableSpec
} from '../types';

export const SAMPLE_WORKERS: WorkerInfo[] = [
  {
    id: 'w-1',
    name: 'Amit Kumar',
    role: 'Senior Field Technician',
    phone: '+91 98712 45890',
    department: 'Road Maintenance',
    team: 'Rapid Pothole Patching Squad A',
    currentTasksCount: 2,
    equipment: ['Bituminous Cold Mix Applicator', 'Vibratory Plate Compactor', 'Laser Leveler', 'Safety Barricades']
  },
  {
    id: 'w-2',
    name: 'Rajesh Verma',
    role: 'Electrical Supervisor',
    phone: '+91 98110 33412',
    department: 'Electrical & Lighting',
    team: 'Zone 2 Streetlight Rapid Squad',
    currentTasksCount: 3,
    equipment: ['Hydraulic Bucket Truck (15m)', 'Multimeter & Cable Fault Locator', 'LED Fixture Replacements']
  },
  {
    id: 'w-3',
    name: 'Suresh Nagar',
    role: 'Sanitation Inspector',
    phone: '+91 97188 90123',
    department: 'Sanitation & Solid Waste',
    team: 'Heavy Waste Clearance Unit',
    currentTasksCount: 1,
    equipment: ['Hydraulic Dumper Placer', 'Mechanical Road Sweeper', 'Disinfectant Spray Unit']
  },
  {
    id: 'w-4',
    name: 'Pooja Sharma',
    role: 'Civil Sub-Engineer',
    phone: '+91 99532 11980',
    department: 'Drainage & Sewerage',
    team: 'Monsoon Desilting & Manhole Crew',
    currentTasksCount: 2,
    equipment: ['Super Sucker Jetting Machine', 'Gas Detector', 'Cast Iron Manhole Replacement Frames']
  },
  {
    id: 'w-5',
    name: 'Dinesh Chandra',
    role: 'Water Works Foreman',
    phone: '+91 98101 77654',
    department: 'Water Supply & Pipelines',
    team: 'High-Pressure Pipeline Response',
    currentTasksCount: 1,
    equipment: ['Ductile Iron Pipe Cutters', 'Electrofusion Welding Rig', 'Ultrasonic Flow Leak Detector']
  }
];

export const SAMPLE_DEPARTMENTS = [
  'Road Maintenance',
  'Sanitation & Solid Waste',
  'Electrical & Lighting',
  'Water Supply & Pipelines',
  'Drainage & Sewerage',
  'Horticulture & Public Assets',
  'Civil Infrastructure'
];

export const GREATER_NOIDA_WARDS = [
  'Ward 12 (Knowledge Park III & IT Zone)',
  'Ward 8 (Pari Chowk & Alpha 1)',
  'Ward 4 (Beta 2 & Commercial Belt)',
  'Ward 7 (Delta 1 & Residential Block)',
  'Ward 15 (Surajpur & Industrial Belt)',
  'Ward 3 (Gamma 2 & Community Centre)',
  'Ward 9 (Ecotech & Extension)'
];

export const CIVIC_PRESET_IMAGES = {
  potholeBefore: '',
  potholeAfter: '',
  garbageBefore: '',
  garbageAfter: '',
  streetlightBefore: '',
  streetlightAfter: '',
  waterLeakBefore: '',
  waterLeakAfter: '',
  drainageBefore: '',
  footpathBefore: '',
  publicAssetBefore: '',
};

// Zero fake demo complaints — only real user-submitted civic data
export const INITIAL_INCIDENTS: CivicIncident[] = [];

export const SAMPLE_HOTSPOTS: HotspotCluster[] = [
  {
    id: 'hs-1',
    name: 'Knowledge Park III University Corridor',
    ward: 'Ward 12',
    category: 'Pothole',
    incidentCount: 17,
    recurrenceScore: 'High (4.8/5)',
    riskLevel: 'CRITICAL',
    suggestedCapitalWork: 'Sub-base bituminous overlay & concrete curb reinforcement (Estimated Capital Plan FY27)',
    estimatedBudget: '₹ 42.5 Lakhs',
    coordinates: [28.4632, 77.4912]
  },
  {
    id: 'hs-2',
    name: 'Pari Chowk & Alpha 1 Transit Hub',
    ward: 'Ward 8',
    category: 'Garbage',
    incidentCount: 14,
    recurrenceScore: 'High (4.2/5)',
    riskLevel: 'HIGH',
    suggestedCapitalWork: 'Installation of automated underground compactor bins & smart fill sensors',
    estimatedBudget: '₹ 28.0 Lakhs',
    coordinates: [28.4735, 77.5028]
  },
  {
    id: 'hs-3',
    name: 'Delta 1 Residential Water Grid',
    ward: 'Ward 7',
    category: 'Water Leakage',
    incidentCount: 11,
    recurrenceScore: 'Moderate (3.6/5)',
    riskLevel: 'HIGH',
    suggestedCapitalWork: 'Replacement of aging 200mm asbestos-cement branch pipes with ductile iron pipelines',
    estimatedBudget: '₹ 35.2 Lakhs',
    coordinates: [28.4892, 77.5218]
  },
  {
    id: 'hs-4',
    name: 'Beta 2 Commercial Spine',
    ward: 'Ward 4',
    category: 'Streetlight',
    incidentCount: 9,
    recurrenceScore: 'Moderate (3.1/5)',
    riskLevel: 'MODERATE',
    suggestedCapitalWork: 'Underground cabling replacement & smart feeder panel installation with central SCADA',
    estimatedBudget: '₹ 19.8 Lakhs',
    coordinates: [28.4710, 77.4980]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Incident #CC-1042 Assigned',
    message: 'Your reported road damage has been assigned to Rapid Pothole Squad (Worker: Amit Kumar). SLA: 6 hrs.',
    timestamp: '10 mins ago',
    unread: true,
    incidentId: 'CC-1042',
    type: 'assigned'
  },
  {
    id: 'notif-2',
    title: '3 Citizen Reports Clustered',
    message: 'AI duplicate engine grouped 3 nearby observations into Master Work Order #CC-1042.',
    timestamp: '25 mins ago',
    unread: true,
    incidentId: 'CC-1042',
    type: 'verified'
  },
  {
    id: 'notif-3',
    title: 'Repair Proof Ready for Audit: #CC-1045',
    message: 'Water pipeline repair completed by Dinesh Chandra in Delta 1. Before/After proof submitted.',
    timestamp: '1 hour ago',
    unread: false,
    incidentId: 'CC-1045',
    type: 'proof_submitted'
  },
  {
    id: 'notif-4',
    title: 'SLA Escalation Alert: #CC-1050',
    message: 'Critical Open Manhole in Surajpur has less than 2 hours of SLA remaining.',
    timestamp: '2 hours ago',
    unread: true,
    incidentId: 'CC-1050',
    type: 'sla_warning'
  }
];

// Complete 13 Backend API Endpoints (Page 10)
export const BACKEND_API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    method: 'POST',
    path: '/api/v1/auth/otp',
    purpose: 'Verify citizen identity via OTP SMS without storing cleartext mobile number (DPDP Act)',
    authRequired: 'Public / Rate-limited',
    sampleRequest: { mobile: '+91 98712 34567', otp: '492810' },
    sampleResponse: { token: 'jwt_civic_eyJhbGciOi...', user_id: 'usr-9102', role: 'Citizen' }
  },
  {
    method: 'POST',
    path: '/api/v1/incidents',
    purpose: 'Create temporary civic incident submission with GPS metadata and provenance tag',
    authRequired: 'Citizen JWT',
    sampleRequest: { category: 'Pothole', description: 'Deep pothole near college gate', lat: 28.4632, lng: 77.4912, provenance: 'live_camera' },
    sampleResponse: { incident_id: 'CC-1042', status: 'SUBMITTED', created_at: '2026-08-18T09:42:00Z' }
  },
  {
    method: 'POST',
    path: '/api/v1/incidents/{id}/media',
    purpose: 'Upload raw photographic proof to encrypted S3 bucket and compute SHA-256 integrity hash',
    authRequired: 'Citizen JWT',
    sampleRequest: { media_type: 'before', mime_type: 'image/jpeg', exif_timestamp: '2026-08-18T09:42:15Z' },
    sampleResponse: { media_id: 'med-8821', storage_key: 's3://civic-media/2026/08/CC-1042-before.jpg', sha256: 'e3b0c442...' }
  },
  {
    method: 'POST',
    path: '/api/v1/incidents/{id}/verify',
    purpose: 'Trigger edge AI multi-signal verification, YOLOv9 classification, and PostGIS duplicate clustering',
    authRequired: 'Internal Service / Edge AI',
    sampleRequest: { incident_id: 'CC-1042' },
    sampleResponse: { verified: true, classification: 'Pothole', confidence: 0.94, duplicates_found: 3, cluster_id: 'CLUSTER-KP3-ROAD-042', priority_score: 86 }
  },
  {
    method: 'GET',
    path: '/api/v1/incidents',
    purpose: 'Retrieve public GIS feed with approximate coordinates and privacy masking filters',
    authRequired: 'Public',
    sampleResponse: { count: 128, incidents: [{ id: 'CC-1042', category: 'Pothole', lat: 28.463, lng: 77.491, status: 'ASSIGNED', confirmations: 23 }] }
  },
  {
    method: 'GET',
    path: '/api/v1/incidents/{id}',
    purpose: 'Fetch comprehensive incident timeline, before/after evidence URLs, and immutable audit logs',
    authRequired: 'Public / Authenticated',
    sampleResponse: { id: 'CC-1042', title: 'Pothole near Knowledge Park Gate 2', department: 'Road Maintenance', status_history: [] }
  },
  {
    method: 'POST',
    path: '/api/v1/incidents/{id}/validate',
    purpose: 'Citizen corroboration ("Still exists" / "Not present") with 1-5 impact rating (Anti-gaming: 1 vote/user)',
    authRequired: 'Citizen JWT',
    sampleRequest: { action: 'confirmed_exists', impact_rating: 5, comment: 'School bus was forced to brake hard' },
    sampleResponse: { success: true, updated_confirmations: 24, average_impact: 4.8 }
  },
  {
    method: 'POST',
    path: '/api/v1/admin/incidents/{id}/acknowledge',
    purpose: 'Official municipal acknowledgement, statutory SLA deadline publication, and department routing',
    authRequired: 'Officer RBAC',
    sampleRequest: { department: 'Road Maintenance', sla_hours: 6, priority_override: null },
    sampleResponse: { status: 'ACKNOWLEDGED', target_deadline: '2026-08-18T18:00:00Z', assigned_officer: 'Officer R. B. Chauhan' }
  },
  {
    method: 'POST',
    path: '/api/v1/admin/incidents/{id}/assign',
    purpose: 'Generate municipal work order and dispatch lead field worker & equipment squad',
    authRequired: 'Officer RBAC',
    sampleRequest: { worker_id: 'w-1', work_order_no: 'WO-KP-902', notes: 'Rapid cold mix compaction squad dispatched' },
    sampleResponse: { status: 'ASSIGNED', assigned_worker: 'Amit Kumar', team: 'Rapid Pothole Patching Squad A' }
  },
  {
    method: 'PATCH',
    path: '/api/v1/worker/incidents/{id}/status',
    purpose: 'Field worker task lifecycle update: Start Work / Pause / Need Assistance',
    authRequired: 'Worker JWT',
    sampleRequest: { status: 'IN_PROGRESS', worker_lat: 28.4632, worker_lng: 77.4912 },
    sampleResponse: { status: 'IN_PROGRESS', checked_in_at: '2026-08-18T15:00:00Z' }
  },
  {
    method: 'POST',
    path: '/api/v1/worker/incidents/{id}/completion',
    purpose: 'Upload after-repair photographic proof with verified GPS geofence and materials logged',
    authRequired: 'Worker JWT',
    sampleRequest: { after_photo_url: 's3://...after.jpg', materials_logged: '50kg cold bitumen mix', worker_notes: 'Compacted and leveled' },
    sampleResponse: { status: 'WORK_COMPLETED', proof_verified: true, ready_for_audit: true }
  },
  {
    method: 'POST',
    path: '/api/v1/incidents/{id}/closure-feedback',
    purpose: 'Citizen final accountability sign-off: verify resolution or dispute/reopen with evidence',
    authRequired: 'Reporting Citizen JWT',
    sampleRequest: { is_resolved: true, feedback: 'Road is smooth now. Excellent repair!' },
    sampleResponse: { status: 'RESOLVED', closed_at: '2026-08-18T17:30:00Z' }
  },
  {
    method: 'GET',
    path: '/api/v1/analytics/hotspots',
    purpose: 'Spatial clustering of recurring infrastructure failures for preventive capital works planning',
    authRequired: 'Officer / Admin RBAC',
    sampleResponse: { hotspots: [{ id: 'hs-1', name: 'Knowledge Park III Corridor', category: 'Pothole', count: 17, recommended_capital_work: 'Bituminous overlay' }] }
  }
];

// Complete 10 Database Relational Schemas (Page 9)
export const DATABASE_TABLE_SCHEMAS: DbTableSpec[] = [
  {
    tableName: 'users',
    description: 'Citizen, Officer, and Field Worker profiles with RBAC and encrypted contact identifiers',
    columns: [
      { name: 'user_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Unique user identifier' },
      { name: 'role', type: 'VARCHAR(20)', constraints: 'NOT NULL (Citizen, Officer, Worker, Admin)', description: 'RBAC user authorization gate' },
      { name: 'verified_contact_hash', type: 'VARCHAR(64)', constraints: 'NOT NULL, UNIQUE', description: 'SHA-256 masked mobile/email hash (DPDP compliance)' },
      { name: 'status', type: 'VARCHAR(15)', constraints: 'DEFAULT "ACTIVE"', description: 'Account status' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Registration timestamp' }
    ]
  },
  {
    tableName: 'incidents',
    description: 'Master civic incident records with PostGIS coordinates, 10-state lifecycle, and department routing',
    columns: [
      { name: 'incident_id', type: 'VARCHAR(20)', constraints: 'PRIMARY KEY', description: 'Human-readable ID e.g. CC-1042' },
      { name: 'category_id', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'Pothole, Streetlight, Garbage, etc.' },
      { name: 'reporter_id', type: 'UUID', constraints: 'REFERENCES users(user_id)', description: 'Citizen reporter' },
      { name: 'geom', type: 'GEOMETRY(Point, 4326)', constraints: 'NOT NULL, SPATIAL INDEX', description: 'PostGIS Lat/Lng coordinates' },
      { name: 'ward_id', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'Municipal ward boundary' },
      { name: 'priority_score', type: 'INT', constraints: '0 - 100', description: 'Explainable weighted priority score' },
      { name: 'status', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'SUBMITTED, VERIFIED, ASSIGNED, RESOLVED, etc.' },
      { name: 'escalation_state', type: 'VARCHAR(20)', constraints: 'DEFAULT "NONE"', description: 'OVERDUE, REOPENED, NEEDS_REVIEW, etc.' },
      { name: 'deadline', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', description: 'Statutory SLA resolution target' },
      { name: 'parent_incident_id', type: 'VARCHAR(20)', constraints: 'REFERENCES incidents(incident_id)', description: 'Consolidated master incident if duplicate' }
    ]
  },
  {
    tableName: 'media',
    description: 'Photographic and audio evidence with cryptographic hashes and EXIF metadata',
    columns: [
      { name: 'media_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Evidence identifier' },
      { name: 'incident_id', type: 'VARCHAR(20)', constraints: 'REFERENCES incidents(incident_id)', description: 'Associated incident' },
      { name: 'type', type: 'VARCHAR(15)', constraints: 'ENUM(before, after, voice_note)', description: 'Evidence classification' },
      { name: 'storage_key', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Encrypted object storage URI' },
      { name: 'sha256_hash', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Tamper-detection cryptographic hash' },
      { name: 'capture_geom', type: 'GEOMETRY(Point, 4326)', constraints: 'NOT NULL', description: 'EXIF GPS coordinates' },
      { name: 'provenance', type: 'VARCHAR(20)', constraints: 'ENUM(live_camera, gallery_upload)', description: 'Capture provenance signal' }
    ]
  },
  {
    tableName: 'validations',
    description: 'Public community corroborations and 1-5 impact ratings with anti-gaming controls',
    columns: [
      { name: 'validation_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Validation entry ID' },
      { name: 'incident_id', type: 'VARCHAR(20)', constraints: 'REFERENCES incidents(incident_id)', description: 'Incident reference' },
      { name: 'user_id', type: 'UUID', constraints: 'REFERENCES users(user_id), UNIQUE(incident_id, user_id)', description: '1 vote per verified user' },
      { name: 'action', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'confirmed_exists, not_present' },
      { name: 'impact_rating', type: 'INT', constraints: '1 to 5', description: 'Safety & movement disruption rating' },
      { name: 'comment', type: 'TEXT', constraints: 'NULLABLE', description: 'Optional context note' }
    ]
  },
  {
    tableName: 'assignments',
    description: 'Municipal work orders, field technician assignments, and equipment dispatch records',
    columns: [
      { name: 'assignment_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Work order ID' },
      { name: 'incident_id', type: 'VARCHAR(20)', constraints: 'REFERENCES incidents(incident_id)', description: 'Incident reference' },
      { name: 'department_id', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Responsible department' },
      { name: 'worker_id', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Lead field technician' },
      { name: 'assigned_by', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Municipal Officer ID' },
      { name: 'assigned_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Dispatch timestamp' }
    ]
  },
  {
    tableName: 'status_history',
    description: 'State transition logs forming the complete lifecycle timeline',
    columns: [
      { name: 'event_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Event identifier' },
      { name: 'incident_id', type: 'VARCHAR(20)', constraints: 'REFERENCES incidents(incident_id)', description: 'Incident reference' },
      { name: 'old_status', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'Previous lifecycle state' },
      { name: 'new_status', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'New lifecycle state' },
      { name: 'actor_id', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'User or system triggering transition' },
      { name: 'reason', type: 'TEXT', constraints: 'NULLABLE', description: 'Transition note or justification' }
    ]
  },
  {
    tableName: 'departments',
    description: 'Municipal departments, geographical jurisdictions, and dispatch routing metadata',
    columns: [
      { name: 'department_id', type: 'VARCHAR(50)', constraints: 'PRIMARY KEY', description: 'e.g. road_maintenance' },
      { name: 'name', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Road Maintenance Dept' },
      { name: 'jurisdiction_geom', type: 'GEOMETRY(Polygon, 4326)', constraints: 'SPATIAL INDEX', description: 'Ward boundary polygon' }
    ]
  },
  {
    tableName: 'sla_rules',
    description: 'Statutory service rules for response deadlines by category and severity band',
    columns: [
      { name: 'rule_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'SLA rule ID' },
      { name: 'category_id', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'Pothole, Drainage, etc.' },
      { name: 'severity_band', type: 'VARCHAR(15)', constraints: 'CRITICAL, HIGH, MEDIUM, LOW', description: 'Severity band' },
      { name: 'max_duration_hours', type: 'INT', constraints: 'NOT NULL', description: 'Mandatory resolution SLA target' }
    ]
  },
  {
    tableName: 'ai_results',
    description: 'AI model inference outputs, confidence metrics, reason codes, and duplicate cluster metadata',
    columns: [
      { name: 'incident_id', type: 'VARCHAR(20)', constraints: 'PRIMARY KEY, REFERENCES incidents(incident_id)', description: 'Incident ID' },
      { name: 'model_version', type: 'VARCHAR(30)', constraints: 'NOT NULL', description: 'CivicVision-v1.4b' },
      { name: 'category_confidence', type: 'FLOAT', constraints: '0.0 to 1.0', description: 'YOLOv9 classification confidence' },
      { name: 'duplicate_score', type: 'FLOAT', constraints: '0.0 to 1.0', description: 'Spatio-temporal cluster probability' },
      { name: 'reason_codes', type: 'JSONB', constraints: 'NOT NULL', description: 'Array of explainable rationale strings' }
    ]
  },
  {
    tableName: 'audit_logs',
    description: 'Immutable SHA-256 event ledger auditing every official deadline, override, and closure action',
    columns: [
      { name: 'log_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Audit log identifier' },
      { name: 'actor', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Citizen, Officer, or Worker ID' },
      { name: 'action', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Work Order Generated, Override, Closed' },
      { name: 'sha256_state_hash', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Cryptographic block signature' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Immutable timestamp' }
    ]
  }
];

// CPGRAMS vs Civic Connect Comparison (Page 13)
export const CPGRAMS_COMPARISON_MATRIX = [
  {
    dimension: 'Evidence Model',
    cpgrams: 'Text complaint form with optional generic attachment (often submitted without GPS or live proof)',
    civicConnect: 'Camera + Geospatial Provenance: Live optical capture with EXIF timestamp, tamper check, and PostGIS verification'
  },
  {
    dimension: 'Visibility & Tracking',
    cpgrams: 'Private ticket visible only to complainant; no public citywide geospatial visibility',
    civicConnect: 'Transparent Public Civic Incident: Published on public GIS radar map with public-safe location precision'
  },
  {
    dimension: 'Duplicate Handling',
    cpgrams: 'Separate tickets filed by multiple citizens; manual officer duplicate review or parallel dispatches',
    civicConnect: 'AI Spatio-Temporal Clustering: 12 citizen observations automatically merged into 1 master work order'
  },
  {
    dimension: 'Priority Determination',
    cpgrams: 'FIFO (First-In, First-Out) or subjective manual officer discretion',
    civicConnect: 'Explainable 6-Factor Formula: Severity, population impact, vulnerability, and corroboration determine objective priority'
  },
  {
    dimension: 'Resolution Verification',
    cpgrams: 'Field department marks ticket "Closed" by entering text remarks; no mandatory photographic evidence',
    civicConnect: 'Mandatory Before/After Proof Slider: Geofenced after-photo verified by officer & citizen sign-off before closure'
  },
  {
    dimension: 'Preventive Intelligence',
    cpgrams: 'Complaints archived as historical grievance logs',
    civicConnect: 'Recurring Hotspot GIS Intelligence: Predicts chronic infrastructure failures for municipal capital budget planning'
  }
];
