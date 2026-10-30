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
  potholeBefore: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  potholeAfter: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  garbageBefore: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  garbageAfter: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
  streetlightBefore: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  streetlightAfter: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  waterLeakBefore: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
  waterLeakAfter: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  drainageBefore: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
  footpathBefore: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  publicAssetBefore: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
};

export const INITIAL_INCIDENTS: CivicIncident[] = [
  // 1. PRIMARY ROAD INFRASTRUCTURE INCIDENT (CIV-2026-00124)
  {
    id: 'CC-1042',
    title: 'Hazardous deep pothole near Knowledge Park 3 Gate 2',
    description: 'Large 40cm pothole right on the primary college road near Gate 2 causing extreme vehicle swerving and two-wheeler skid risk.',
    category: 'Pothole',
    status: 'ASSIGNED',
    escalationState: 'NONE',
    priorityLevel: 'HIGH',
    priorityScore: 86,
    priorityBreakdown: {
      severity: 26, // max 30
      publicImpact: 18, // max 20 (>12k students/day)
      vulnerability: 14, // max 15 (University crossing)
      corroboration: 14, // max 15 (23 citizens confirmed)
      persistence: 6, // max 10 (3 days active)
      locationContext: 8, // max 10 (Arterial transit line)
      totalScore: 86
    },
    location: {
      lat: 28.4632,
      lng: 77.4912,
      address: 'Knowledge Park III, Institutional Area, Greater Noida, UP 201310',
      ward: 'Ward 12',
      landmark: 'Opposite GCET College Gate 2 & Sharda University crossing',
      hotspotZone: 'Knowledge Park Student Transit Corridor',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.potholeBefore,
      afterPhotoUrl: CIVIC_PRESET_IMAGES.potholeAfter,
      photoTimestamp: '18 Aug 2026, 09:42 AM',
      gpsVerified: true,
      provenance: 'live_camera',
      hasVoiceNote: true,
      voiceTranscript: 'कॉलेज के गेट के सामने बहुत बड़ा गड्ढा हो गया है, दो पहिया वाहन फिसल रहे हैं। (Large pothole in front of college gate, two-wheelers skidding.)',
      deviceMetadata: {
        device: 'Realme 11 Pro / Android 14',
        accuracyMeters: 3.2,
        tamperCheckPassed: true,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    },
    aiMetadata: {
      classification: 'Pothole / Severe Road Depression',
      confidence: 94,
      evidenceRelevance: 98,
      duplicateClusterProbability: 91,
      modelVersion: 'CivicVision-v1.4b (YOLO-v9 + PostGIS)',
      suggestedDepartment: 'Road Maintenance',
      suggestedWard: 'Ward 12',
      reasonCodes: [
        'High severity pavement failure (>35cm depth estimate)',
        'High transit density (University corridor >12,000 daily commuters)',
        'Pedestrian & two-wheeler accident vulnerability zone',
        'Multiple corroborating citizen reports clustered within 100m radius',
        'Monsoon water-logging risk factor active'
      ],
      duplicateClusterId: 'CLUSTER-KP3-ROAD-042'
    },
    linkedReports: [
      {
        id: 'CC-1047',
        reporterMasked: 'Rohit S. (+91 98*** 1290)',
        distanceMeters: 48,
        reportedAgo: '2 hours ago',
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=75',
        description: 'Dangerous pothole near the bus stand right in the middle of road.',
        timestamp: '18 Aug 2026, 10:15 AM',
        provenance: 'live_camera'
      },
      {
        id: 'CC-1051',
        reporterMasked: 'Dr. Ananya P. (+91 97*** 4481)',
        distanceMeters: 71,
        reportedAgo: '4 hours ago',
        photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=75',
        description: 'Road broken near the college turn. Needs immediate cold mix patch.',
        timestamp: '18 Aug 2026, 08:30 AM',
        provenance: 'live_camera'
      },
      {
        id: 'CC-1055',
        reporterMasked: 'Manish G. (+91 99*** 0032)',
        distanceMeters: 93,
        reportedAgo: '5 hours ago',
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=75',
        description: 'Major road crater causing traffic bottleneck every morning.',
        timestamp: '18 Aug 2026, 07:15 AM',
        provenance: 'live_camera'
      }
    ],
    communityConfirmations: 23,
    communityDisagreements: 0,
    averageImpactRating: 4.8,
    validationsList: [
      {
        id: 'val-1',
        userIdMasked: 'Aarav M. (Ward 12 Resident)',
        action: 'confirmed_exists',
        impactRating: 5,
        comment: 'School bus was forced to brake hard right here today morning.',
        timestamp: '18 Aug 2026, 10:00 AM'
      },
      {
        id: 'val-2',
        userIdMasked: 'Priya K. (Commuter)',
        action: 'confirmed_exists',
        impactRating: 5,
        comment: 'Water accumulates inside when it rains, making it invisible to bikes.',
        timestamp: '18 Aug 2026, 10:15 AM'
      }
    ],
    department: 'Road Maintenance',
    assignedWorker: SAMPLE_WORKERS[0], // Amit Kumar
    deadline: '18 Aug 2026, 06:00 PM',
    slaHoursRemaining: 6,
    isSlaAtRisk: false,
    officerNotes: 'Assigned to Rapid Pothole Patching Squad A. Materials dispatched from Alpha Asphalt Depot.',
    workerNotes: 'Bituminous cold mix compaction scheduled for 03:30 PM.',
    materialsLogged: '50kg Bitumen Cold Mix Type II, Bituminous Emulsion RS-1 (10L)',
    createdAt: '18 Aug 2026, 09:45 AM',
    updatedAt: '18 Aug 2026, 10:20 AM',
    auditLogs: [
      {
        id: 'log-1',
        timestamp: '18 Aug 2026, 09:42 AM',
        actor: 'Citizen (Raj Jaiswal / Priya S.)',
        role: 'Citizen',
        action: 'Report Submitted',
        details: 'Initial report submitted via Mobile PWA with verified GPS telemetry (28.4632, 77.4912) and optical proof.',
        sha256Hash: 'a8f5c3d1e9b2...8472'
      },
      {
        id: 'log-2',
        timestamp: '18 Aug 2026, 09:43 AM',
        actor: 'AI Vision Pipeline',
        role: 'AI System (v1.4b)',
        action: 'AI Classification & Validation',
        details: 'Category verified as "Pothole / Road Damage" (Confidence: 94%, Evidence Relevance: 98%). Explainable priority score: 86/100.',
        modelVersion: 'CivicVision-v1.4b',
        confidence: 94,
        sha256Hash: 'b4e2f9d8a1c3...9014'
      },
      {
        id: 'log-3',
        timestamp: '18 Aug 2026, 09:44 AM',
        actor: 'GIS Clustering Engine',
        role: 'AI System (v1.4b)',
        action: 'Duplicate Cluster Consolidated',
        details: '3 nearby reports (#CC-1047, #CC-1051, #CC-1055) linked to Master Incident #CC-1042 using spatio-temporal radius (100m / 6h window).',
        sha256Hash: 'c7d1e4b8a2f9...1123'
      },
      {
        id: 'log-4',
        timestamp: '18 Aug 2026, 10:18 AM',
        actor: 'Officer R. B. Chauhan',
        role: 'Municipal Officer',
        action: 'Work Order Generated & Dispatched',
        details: 'Officer accepted AI recommendation. Work order #WO-KP-902 dispatched to Road Maintenance Squad A (Amit Kumar). SLA set to 6 hours.',
        sha256Hash: 'd3f9b2a1c8e4...4456'
      }
    ]
  },

  // 2. CC-1043: Garbage Accumulation at Pari Chowk (Status: PUBLIC / VALIDATED)
  {
    id: 'CC-1043',
    title: 'Overflowing commercial waste bin near Pari Chowk Bus Terminal',
    description: 'Waste container overflowing onto pedestrian walkway. Stray cattle and foul odor disrupting commuter boarding.',
    category: 'Garbage',
    status: 'PUBLIC',
    escalationState: 'NONE',
    priorityLevel: 'MEDIUM',
    priorityScore: 68,
    priorityBreakdown: {
      severity: 16,
      publicImpact: 18,
      vulnerability: 10,
      corroboration: 12,
      persistence: 6,
      locationContext: 6,
      totalScore: 68
    },
    location: {
      lat: 28.4735,
      lng: 77.5028,
      address: 'Pari Chowk Central Roundabout, Sector Alpha 1, Greater Noida',
      ward: 'Ward 8',
      landmark: 'Near Noida Metro Aqua Line Station Exit 2',
      hotspotZone: 'Pari Chowk Transit Hub',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.garbageBefore,
      afterPhotoUrl: CIVIC_PRESET_IMAGES.garbageAfter,
      photoTimestamp: '18 Aug 2026, 07:30 AM',
      gpsVerified: true,
      provenance: 'live_camera'
    },
    aiMetadata: {
      classification: 'Solid Waste / Commercial Dump',
      confidence: 91,
      evidenceRelevance: 96,
      duplicateClusterProbability: 75,
      modelVersion: 'CivicVision-v1.4b',
      suggestedDepartment: 'Sanitation & Solid Waste',
      suggestedWard: 'Ward 8',
      reasonCodes: ['Transit hub high footfall', 'Obstruction of public sidewalk']
    },
    linkedReports: [],
    communityConfirmations: 15,
    communityDisagreements: 1,
    averageImpactRating: 3.9,
    validationsList: [],
    department: 'Sanitation & Solid Waste',
    assignedWorker: SAMPLE_WORKERS[2], // Suresh Nagar
    slaHoursRemaining: 18,
    isSlaAtRisk: false,
    createdAt: '18 Aug 2026, 07:32 AM',
    updatedAt: '18 Aug 2026, 08:00 AM',
    auditLogs: [
      {
        id: 'log-10',
        timestamp: '18 Aug 2026, 07:32 AM',
        actor: 'Citizen (Vikas M.)',
        role: 'Citizen',
        action: 'Report Submitted',
        details: 'Garbage accumulation photo submitted.'
      }
    ]
  },

  // 3. CC-1044: Streetlight Failure (Status: IN_PROGRESS)
  {
    id: 'CC-1044',
    title: 'High-mast LED light failure on Sector Alpha 1 Main Market Spine',
    description: 'Complete blackout of 4 consecutive LED poles creating dark stretch and safety concern for evening shoppers.',
    category: 'Streetlight',
    status: 'IN_PROGRESS',
    escalationState: 'NONE',
    priorityLevel: 'HIGH',
    priorityScore: 82,
    priorityBreakdown: {
      severity: 22,
      publicImpact: 18,
      vulnerability: 15,
      corroboration: 14,
      persistence: 5,
      locationContext: 8,
      totalScore: 82
    },
    location: {
      lat: 28.4791,
      lng: 77.5134,
      address: 'Alpha 1 Commercial Belt, Market Corridor, Greater Noida',
      ward: 'Ward 8',
      landmark: 'Near Alpha 1 Central Post Office',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.streetlightBefore,
      afterPhotoUrl: CIVIC_PRESET_IMAGES.streetlightAfter,
      photoTimestamp: '17 Aug 2026, 08:15 PM',
      gpsVerified: true,
      provenance: 'live_camera'
    },
    aiMetadata: {
      classification: 'Streetlight / Multi-Pole Circuit Fault',
      confidence: 96,
      evidenceRelevance: 95,
      duplicateClusterProbability: 84,
      modelVersion: 'CivicVision-v1.4b',
      suggestedDepartment: 'Electrical & Lighting',
      suggestedWard: 'Ward 8',
      reasonCodes: ['Women safety priority area', 'Market public space dark zone']
    },
    linkedReports: [],
    communityConfirmations: 31,
    communityDisagreements: 0,
    averageImpactRating: 4.6,
    validationsList: [],
    department: 'Electrical & Lighting',
    assignedWorker: SAMPLE_WORKERS[1], // Rajesh Verma
    deadline: '18 Aug 2026, 02:00 PM',
    slaHoursRemaining: 4,
    isSlaAtRisk: false,
    createdAt: '17 Aug 2026, 08:20 PM',
    updatedAt: '18 Aug 2026, 09:00 AM',
    auditLogs: [
      {
        id: 'log-20',
        timestamp: '18 Aug 2026, 09:00 AM',
        actor: 'Field Worker (Rajesh Verma)',
        role: 'Field Worker',
        action: 'Repair Started',
        details: 'Technician reached site with bucket truck. Transformer line diagnostic in progress.'
      }
    ]
  },

  // 4. CC-1045: Water Pipeline Burst (Status: WORK_COMPLETED / PROOF SUBMITTED)
  {
    id: 'CC-1045',
    title: 'Potable water distribution pipeline leak flooding road in Delta 1',
    description: 'High pressure drinking water pipe ruptured underneath road surface, water gushing onto residential road and wasting treated supply.',
    category: 'Water Leakage',
    status: 'WORK_COMPLETED',
    escalationState: 'NONE',
    priorityLevel: 'CRITICAL',
    priorityScore: 92,
    priorityBreakdown: {
      severity: 28,
      publicImpact: 16,
      vulnerability: 14,
      corroboration: 14,
      persistence: 10,
      locationContext: 10,
      totalScore: 92
    },
    location: {
      lat: 28.4892,
      lng: 77.5218,
      address: 'Delta 1, Sector Road B-Block, Greater Noida',
      ward: 'Ward 7',
      landmark: 'Near Delta 1 Community Health Centre',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.waterLeakBefore,
      afterPhotoUrl: CIVIC_PRESET_IMAGES.waterLeakAfter,
      photoTimestamp: '17 Aug 2026, 03:00 PM',
      gpsVerified: true,
      provenance: 'live_camera'
    },
    aiMetadata: {
      classification: 'Water Main Line Rupture',
      confidence: 97,
      evidenceRelevance: 99,
      duplicateClusterProbability: 60,
      modelVersion: 'CivicVision-v1.4b',
      suggestedDepartment: 'Water Supply & Pipelines',
      suggestedWard: 'Ward 7',
      reasonCodes: ['Precious resource loss', 'Road sub-base erosion risk', 'Hospital proximity']
    },
    linkedReports: [],
    communityConfirmations: 42,
    communityDisagreements: 0,
    averageImpactRating: 4.9,
    validationsList: [],
    department: 'Water Supply & Pipelines',
    assignedWorker: SAMPLE_WORKERS[4], // Dinesh Chandra
    deadline: '18 Aug 2026, 11:00 AM',
    slaHoursRemaining: 1,
    isSlaAtRisk: false,
    createdAt: '17 Aug 2026, 03:15 PM',
    updatedAt: '18 Aug 2026, 08:30 AM',
    auditLogs: [
      {
        id: 'log-30',
        timestamp: '18 Aug 2026, 08:30 AM',
        actor: 'Field Worker (Dinesh Chandra)',
        role: 'Field Worker',
        action: 'Completion Proof Uploaded',
        details: 'Cast iron pipe replacement completed and pressure tested at 4.2 bar. After-photo uploaded with verified GPS tag.'
      }
    ]
  },

  // 5. CC-1046: Clogged Drainage (Status: RESOLVED)
  {
    id: 'CC-1046',
    title: 'Monsoon storm drain desilting completed at Beta 2 Market Ring',
    description: 'Blocked drain chamber cleared of plastic debris and silt buildup to prevent monsoon inundation.',
    category: 'Drainage',
    status: 'RESOLVED',
    escalationState: 'NONE',
    priorityLevel: 'MEDIUM',
    priorityScore: 64,
    priorityBreakdown: {
      severity: 16,
      publicImpact: 16,
      vulnerability: 10,
      corroboration: 10,
      persistence: 6,
      locationContext: 6,
      totalScore: 64
    },
    location: {
      lat: 28.4710,
      lng: 77.4980,
      address: 'Sector Beta 2 Central Plaza, Greater Noida',
      ward: 'Ward 4',
      landmark: 'Near Beta 2 Shopping Complex',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.drainageBefore,
      afterPhotoUrl: CIVIC_PRESET_IMAGES.drainageBefore, // repaired
      photoTimestamp: '15 Aug 2026, 11:00 AM',
      gpsVerified: true,
      provenance: 'live_camera'
    },
    aiMetadata: {
      classification: 'Stormwater Drainage Siltation',
      confidence: 93,
      evidenceRelevance: 94,
      duplicateClusterProbability: 40,
      modelVersion: 'CivicVision-v1.4b',
      suggestedDepartment: 'Drainage & Sewerage',
      suggestedWard: 'Ward 4',
      reasonCodes: ['Pre-monsoon preparedness schedule']
    },
    linkedReports: [],
    communityConfirmations: 19,
    communityDisagreements: 0,
    averageImpactRating: 4.2,
    validationsList: [],
    department: 'Drainage & Sewerage',
    assignedWorker: SAMPLE_WORKERS[3], // Pooja Sharma
    slaHoursRemaining: 0,
    isSlaAtRisk: false,
    createdAt: '15 Aug 2026, 11:15 AM',
    updatedAt: '16 Aug 2026, 04:30 PM',
    auditLogs: [
      {
        id: 'log-40',
        timestamp: '16 Aug 2026, 05:00 PM',
        actor: 'Citizen (Priya S.)',
        role: 'Citizen',
        action: 'Citizen Final Verification Passed',
        details: 'Citizen inspected desilted chamber on mobile PWA and marked issue as successfully resolved.'
      }
    ]
  },

  // 6. CC-1048: AI LOW CONFIDENCE FALLBACK (Escalation: NEEDS_REVIEW)
  {
    id: 'CC-1048',
    title: 'Irregular ground depression / unidentified debris near Sector 62 Link',
    description: 'Uneven ground surface with partial cement tiles scattered. Unclear whether civil road defect or private builder material.',
    category: 'Footpath',
    status: 'SUBMITTED',
    escalationState: 'NEEDS_REVIEW',
    priorityLevel: 'LOW',
    priorityScore: 52,
    priorityBreakdown: {
      severity: 12,
      publicImpact: 12,
      vulnerability: 8,
      corroboration: 6,
      persistence: 6,
      locationContext: 8,
      totalScore: 52
    },
    location: {
      lat: 28.4550,
      lng: 77.4850,
      address: 'Knowledge Park II Outer Service Lane, Greater Noida',
      ward: 'Ward 12',
      landmark: 'Near Metro Pillar 188',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.footpathBefore,
      photoTimestamp: '18 Aug 2026, 06:10 AM',
      gpsVerified: true,
      provenance: 'gallery_upload'
    },
    aiMetadata: {
      classification: 'Ambiguous Surface Disruption',
      confidence: 54, // Below 75% threshold!
      evidenceRelevance: 62,
      duplicateClusterProbability: 25,
      modelVersion: 'CivicVision-v1.4b',
      suggestedDepartment: 'Civil Infrastructure (Unconfirmed)',
      suggestedWard: 'Ward 12',
      reasonCodes: [
        '⚠️ Low confidence (54%) below automated routing threshold (75%)',
        'Obscured optical view / mixed material footprint',
        'Mandatory Human Officer Review required before assignment'
      ],
      isLowConfidence: true
    },
    linkedReports: [],
    communityConfirmations: 3,
    communityDisagreements: 1,
    averageImpactRating: 2.5,
    validationsList: [],
    department: 'Pending Officer Triage',
    slaHoursRemaining: 24,
    isSlaAtRisk: false,
    createdAt: '18 Aug 2026, 06:15 AM',
    updatedAt: '18 Aug 2026, 06:15 AM',
    auditLogs: [
      {
        id: 'log-50',
        timestamp: '18 Aug 2026, 06:15 AM',
        actor: 'AI Vision Pipeline',
        role: 'AI System (v1.4b)',
        action: 'Flagged for Human Review',
        details: 'Confidence (54%) below 75% threshold. Automated dispatch paused; routed to Officer Manual Review Queue.'
      }
    ]
  },

  // 7. CC-1050: Critical Open Manhole (Escalation: OVERDUE / SLA At Risk)
  {
    id: 'CC-1050',
    title: 'CRITICAL: Missing manhole cover on main traffic carriageway near Surajpur',
    description: 'Uncovered 3-foot sewer chamber in middle of active vehicle lane without warning barricade.',
    category: 'Drainage',
    status: 'ASSIGNED',
    escalationState: 'OVERDUE',
    priorityLevel: 'CRITICAL',
    priorityScore: 98,
    priorityBreakdown: {
      severity: 30, // max 30
      publicImpact: 20, // max 20
      vulnerability: 15, // max 15
      corroboration: 15, // max 15
      persistence: 8, // max 10
      locationContext: 10, // max 10
      totalScore: 98
    },
    location: {
      lat: 28.5120,
      lng: 77.4900,
      address: 'Surajpur Main Highway Road near Collectorate, Greater Noida',
      ward: 'Ward 15',
      landmark: 'Opposite District Court Complex',
      isPublicSafePrecision: true
    },
    evidence: {
      beforePhotoUrl: CIVIC_PRESET_IMAGES.drainageBefore,
      photoTimestamp: '18 Aug 2026, 05:00 AM',
      gpsVerified: true,
      provenance: 'live_camera'
    },
    aiMetadata: {
      classification: 'High-Hazard Manhole Void',
      confidence: 98,
      evidenceRelevance: 99,
      duplicateClusterProbability: 88,
      modelVersion: 'CivicVision-v1.4b',
      suggestedDepartment: 'Drainage & Sewerage',
      suggestedWard: 'Ward 15',
      reasonCodes: ['Immediate fatal hazard risk', 'Heavy arterial traffic corridor', 'Emergency barricading dispatched']
    },
    linkedReports: [],
    communityConfirmations: 58,
    communityDisagreements: 0,
    averageImpactRating: 5.0,
    validationsList: [],
    department: 'Drainage & Sewerage',
    assignedWorker: SAMPLE_WORKERS[3],
    deadline: '18 Aug 2026, 08:00 AM',
    slaHoursRemaining: 1, // SLA at risk!
    isSlaAtRisk: true,
    createdAt: '18 Aug 2026, 05:05 AM',
    updatedAt: '18 Aug 2026, 06:00 AM',
    auditLogs: []
  }
];

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
