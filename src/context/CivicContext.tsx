import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CivicIncident,
  IncidentCategory,
  PriorityLevel,
  WorkerInfo,
  OfficerProfile,
  OfficerAccount,
  NotificationItem,
  HotspotCluster,
  AuditLogEntry,
  IncidentStatus,
  DeadlineExtension
} from '../types';
import {
  INITIAL_INCIDENTS,
  SAMPLE_WORKERS,
  SAMPLE_HOTSPOTS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';
import { apiClient } from '../services/api';
import { parseDeadline, formatDeadlineDate } from '../utils/deadlines';
import confetti from 'canvas-confetti';

export const DEFAULT_OFFICER_PROFILE: OfficerProfile = {
  id: 'OFF-402',
  name: 'Er. R. B. Chauhan',
  designation: 'Executive Engineer (Civil) & Zonal Officer',
  badge_number: 'GNIDA-EE-2024-042',
  department: 'Roads & Public Works Department',
  zone: 'Zone 1 (Wards 1–15), Greater Noida',
  phone: '+91 120 232-6000',
  email: 'officer.chauhan@gnida.in',
  office_address: 'GNIDA Administrative Complex, Sector Knowledge Park IV, Greater Noida, UP - 201310',
  jurisdiction_wards: [
    'Ward 1 (Alpha I & II)',
    'Ward 2 (Beta I & II)',
    'Ward 3 (Gamma I & II)',
    'Ward 4 (Delta I & II)',
    'Ward 12 (Knowledge Park III)',
    'Ward 14 (Pari Chowk Junction)'
  ],
  shift_status: 'Active On Duty — Zonal Triage Command',
  last_login: 'Today at 08:30 AM'
};

const DEFAULT_OFFICER_ACCOUNT: OfficerAccount = {
  id: 'OFF-402',
  name: 'Er. R. B. Chauhan',
  mobile: '9812345670',
  email: 'officer.chauhan@gnida.in',
  department: 'Roads & Public Works Department',
  designation: 'Executive Engineer (Civil) & Zonal Officer',
  jurisdiction: 'Zone 1 (Wards 1–15, Greater Noida)',
  badgeNumber: 'GNIDA-EE-2024-042',
  isVerified: true,
  approvalStatus: 'APPROVED',
  createdAt: '2026-01-15T09:00:00Z',
  officeAddress: 'GNIDA Administrative Complex, Sector Knowledge Park IV, Greater Noida, UP - 201310'
};

interface CivicContextType {
  incidents: CivicIncident[];
  workers: WorkerInfo[];
  hotspots: HotspotCluster[];
  notifications: NotificationItem[];
  officerProfile: OfficerProfile;
  authenticatedOfficer: OfficerAccount | null;
  authenticatedWorker: WorkerInfo | null;
  isBackendOnline: boolean;
  currentRole: 'citizen' | 'officer' | 'worker';
  setCurrentRole: (role: 'citizen' | 'officer' | 'worker') => void;
  selectedIncident: CivicIncident | null;
  setSelectedIncident: (incident: CivicIncident | null) => void;
  
  // UI Dialog States
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isAIVerifyModalOpen: boolean;
  setIsAIVerifyModalOpen: (open: boolean) => void;
  isApiExplorerOpen: boolean;
  setIsApiExplorerOpen: (open: boolean) => void;
  isOfficerProfileModalOpen: boolean;
  setIsOfficerProfileModalOpen: (open: boolean) => void;
  isOfficerAuthModalOpen: boolean;
  setIsOfficerAuthModalOpen: (open: boolean) => void;
  isWorkerAuthModalOpen: boolean;
  setIsWorkerAuthModalOpen: (open: boolean) => void;
  isMobileFrameActive: boolean;
  setIsMobileFrameActive: (active: boolean) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Audio chime player
  playSound: (type: 'success' | 'scan' | 'click' | 'alert') => void;

  // Officer Authentication
  loginOfficer: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerOfficer: (data: {
    name: string;
    mobile: string;
    email: string;
    department: string;
    designation: string;
    jurisdiction: string;
    password: string;
    autoApprove?: boolean;
  }) => Promise<{ success: boolean; message: string; requiresApproval?: boolean }>;
  logoutOfficer: () => void;

  // Worker Authentication
  loginWorker: (workerId: string) => void;
  logoutWorker: () => void;

  // Actions
  createIncident: (incidentData: Partial<CivicIncident>) => CivicIncident;
  approveIncident: (
    incidentId: string,
    workerId?: string,
    deadlineDays?: number,
    customDeadline?: string,
    notes?: string
  ) => void;
  assignIncident: (
    incidentId: string,
    workerId: string,
    deadline: string,
    notes?: string
  ) => void;
  rejectIncident: (incidentId: string, reason: string) => void;
  requestMoreInfo: (incidentId: string, notes: string) => void;
  startWork: (incidentId: string) => void;
  updateWorkerTaskStatus: (
    incidentId: string,
    status: 'IN_PROGRESS' | 'ASSIGNED' | 'WORK_STARTED',
    notes?: string
  ) => void;
  submitRepairProof: (
    incidentId: string,
    afterPhotoUrl: string,
    workerNotes?: string,
    materialsLogged?: string
  ) => void;
  verifyCompletedWork: (incidentId: string, approved: boolean, notes?: string) => void;
  approveRepairProof: (incidentId: string) => void;
  extendDeadline: (incidentId: string, newDeadline: string, reason: string) => void;
  updateProgressPercent: (incidentId: string, percent: number) => void;
  overrideAiRecommendation: (
    incidentId: string,
    override: {
      category?: IncidentCategory;
      priorityLevel?: PriorityLevel;
      priorityScore?: number;
      department?: string;
      reason: string;
    }
  ) => void;
  citizenConfirmResolution: (
    incidentId: string,
    isSatisfied: boolean,
    rating: number,
    comment?: string
  ) => void;
  citizenDisputeResolution: (incidentId: string, reason: string) => void;
  reopenIncident: (incidentId: string, reason: string, actorRole: 'Citizen' | 'Municipal Officer') => void;
  votePublicValidation: (
    incidentId: string,
    action: 'confirmed_exists' | 'not_present_wrong_location',
    impactRating: number,
    comment?: string
  ) => void;
  toggleFollowIncident: (incidentId: string) => void;
  markNotificationRead: (id: string) => void;
  resetToDefaultData: () => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'civic_connect_incidents_v4';
const NOTIFS_STORAGE_KEY = 'civic_connect_notifs_v4';
const OFFICER_STORAGE_KEY = 'civic_connect_officer_v4';
const REGISTERED_OFFICERS_KEY = 'civic_connect_all_officers_v4';
const WORKER_STORAGE_KEY = 'civic_connect_worker_v4';

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<CivicIncident[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load from storage', e);
    }
    return INITIAL_INCIDENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notifs', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [workers] = useState<WorkerInfo[]>(SAMPLE_WORKERS);
  const [hotspots] = useState<HotspotCluster[]>(SAMPLE_HOTSPOTS);

  // Officer Authentication State
  const [authenticatedOfficer, setAuthenticatedOfficer] = useState<OfficerAccount | null>(() => {
    try {
      const saved = localStorage.getItem(OFFICER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved officer', e);
    }
    return DEFAULT_OFFICER_ACCOUNT;
  });

  const [registeredOfficers, setRegisteredOfficers] = useState<OfficerAccount[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_OFFICERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load registered officers', e);
    }
    return [DEFAULT_OFFICER_ACCOUNT];
  });

  // Worker Authentication State
  const [authenticatedWorker, setAuthenticatedWorker] = useState<WorkerInfo | null>(() => {
    try {
      const saved = localStorage.getItem(WORKER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved worker', e);
    }
    return SAMPLE_WORKERS[0] || null;
  });

  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['citizen', 'officer', 'worker', 'analytics', 'audit'].includes(tabParam)) {
        return tabParam;
      }
      const hash = window.location.hash.replace('#', '');
      if (hash && ['citizen', 'officer', 'worker', 'analytics', 'audit'].includes(hash)) {
        return hash;
      }
    }
    return 'citizen';
  });

  const [currentRole, setCurrentRole] = useState<'citizen' | 'officer' | 'worker'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'officer') return 'officer';
      if (tabParam === 'worker') return 'worker';
    }
    return 'citizen';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const [selectedIncident, setSelectedIncident] = useState<CivicIncident | null>(null);

  // Modals & Navigation State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAIVerifyModalOpen, setIsAIVerifyModalOpen] = useState<boolean>(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState<boolean>(false);
  const [isOfficerProfileModalOpen, setIsOfficerProfileModalOpen] = useState<boolean>(false);
  const [isOfficerAuthModalOpen, setIsOfficerAuthModalOpen] = useState<boolean>(false);
  const [isWorkerAuthModalOpen, setIsWorkerAuthModalOpen] = useState<boolean>(false);
  const [isMobileFrameActive, setIsMobileFrameActive] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save incidents', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifs', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      if (authenticatedOfficer) {
        localStorage.setItem(OFFICER_STORAGE_KEY, JSON.stringify(authenticatedOfficer));
      } else {
        localStorage.removeItem(OFFICER_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save officer', e);
    }
  }, [authenticatedOfficer]);

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_OFFICERS_KEY, JSON.stringify(registeredOfficers));
    } catch (e) {
      console.warn('Failed to save registered officers', e);
    }
  }, [registeredOfficers]);

  useEffect(() => {
    try {
      if (authenticatedWorker) {
        localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(authenticatedWorker));
      } else {
        localStorage.removeItem(WORKER_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save worker', e);
    }
  }, [authenticatedWorker]);

  // Keep selected incident updated
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find((i) => i.id === selectedIncident.id);
      if (updated) setSelectedIncident(updated);
    }
  }, [incidents]);

  // Check backend health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        setIsBackendOnline(res.ok);
      } catch {
        setIsBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (
    title: string,
    message: string,
    incidentId: string,
    type: NotificationItem['type']
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      unread: true,
      incidentId,
      type
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const playSound = (_type: 'success' | 'scan' | 'click' | 'alert') => {
    // Keep subtle/clean, user can enable if needed
  };

  // -------------------------------------------------------------
  // OFFICER AUTHENTICATION
  // -------------------------------------------------------------
  const loginOfficer = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const officer = registeredOfficers.find((o) => o.email.toLowerCase() === normalizedEmail);

    if (!officer) {
      return { success: false, message: 'No registered officer account found with this email. Please register your account.' };
    }

    if (officer.approvalStatus === 'PENDING') {
      return { success: false, message: 'Your account is pending administrative verification. Please wait for zonal administrator approval.' };
    }

    if (officer.approvalStatus === 'REJECTED') {
      return { success: false, message: 'Your officer registration was not approved by the municipal administration.' };
    }

    if (password !== 'officer123' && officer.passwordHash && password !== officer.passwordHash) {
      return { success: false, message: 'Invalid password. Please check your official credentials.' };
    }

    setAuthenticatedOfficer(officer);
    setCurrentRole('officer');
    addNotification(
      'Officer Login Successful',
      `Welcome back, ${officer.name} (${officer.designation}). Viewing ${officer.jurisdiction}.`,
      incidents[0]?.id || '',
      'officer_review'
    );
    return { success: true, message: `Welcome back, ${officer.name}` };
  };

  const registerOfficer = async (data: {
    name: string;
    mobile: string;
    email: string;
    department: string;
    designation: string;
    jurisdiction: string;
    password: string;
    autoApprove?: boolean;
  }): Promise<{ success: boolean; message: string; requiresApproval?: boolean }> => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = registeredOfficers.find((o) => o.email.toLowerCase() === normalizedEmail);

    if (existing) {
      return { success: false, message: 'An officer account is already registered with this email address.' };
    }

    const badgeNumber = `GNIDA-${data.department.slice(0, 2).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;
    const isApproved = data.autoApprove ?? true;

    const newOfficer: OfficerAccount = {
      id: `OFF-${Date.now()}`,
      name: data.name,
      mobile: data.mobile,
      email: normalizedEmail,
      department: data.department,
      designation: data.designation,
      jurisdiction: data.jurisdiction,
      badgeNumber,
      passwordHash: data.password,
      isVerified: isApproved,
      approvalStatus: isApproved ? 'APPROVED' : 'PENDING',
      createdAt: new Date().toISOString()
    };

    setRegisteredOfficers((prev) => [...prev, newOfficer]);

    if (isApproved) {
      setAuthenticatedOfficer(newOfficer);
      setCurrentRole('officer');
      addNotification(
        'Officer Account Registered & Verified',
        `Official credentials granted to ${newOfficer.name} (${newOfficer.badgeNumber}).`,
        incidents[0]?.id || '',
        'officer_review'
      );
      return { success: true, message: 'Registration approved! Officer session active.' };
    } else {
      return {
        success: true,
        message: 'Registration submitted. Account pending administrative clearance from Zonal Headquarters.',
        requiresApproval: true
      };
    }
  };

  const logoutOfficer = () => {
    setAuthenticatedOfficer(null);
    setCurrentRole('citizen');
    setActiveTab('citizen');
    playSound('click');
  };

  // -------------------------------------------------------------
  // FIELD WORKER AUTHENTICATION
  // -------------------------------------------------------------
  const loginWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (worker) {
      setAuthenticatedWorker(worker);
      setCurrentRole('worker');
      addNotification(
        'Field Crew Logged In',
        `${worker.name} (${worker.team}) active for dispatch.`,
        incidents[0]?.id || '',
        'assigned'
      );
    }
  };

  const logoutWorker = () => {
    setAuthenticatedWorker(null);
    setCurrentRole('citizen');
    setActiveTab('citizen');
  };

  // -------------------------------------------------------------
  // COMPLAINT SUBMISSION & ROUTING (Section 4)
  // -------------------------------------------------------------
  const createIncident = (incidentData: Partial<CivicIncident>): CivicIncident => {
    const newSeq = incidents.length + 120;
    const newId = `CIV-2026-${String(newSeq).padStart(5, '0')}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Automatic Department Mapping based on Category (Section 4)
    let autoDept = 'Roads & Public Works Department';
    const cat = incidentData.category || 'Pothole';
    if (cat === 'Garbage') autoDept = 'Sanitation & Solid Waste Management';
    else if (cat === 'Streetlight') autoDept = 'Electrical & Street Lighting Department';
    else if (cat === 'Water Leakage') autoDept = 'Water Supply & Sewage Department';
    else if (cat === 'Drainage' || cat === 'Open Manhole') autoDept = 'Drainage & Manhole Infrastructure';
    else if (cat === 'Footpath' || cat === 'Public Asset') autoDept = 'Civil Assets & Infrastructure Maintenance';

    const newIncident: CivicIncident = {
      id: newId,
      title: incidentData.title || `${cat} reported at ${incidentData.location?.address?.slice(0, 32) || 'Location'}`,
      description: incidentData.description || 'Public complaint registered by citizen for municipal resolution.',
      category: cat,
      status: 'SUBMITTED', // Section 7 initial state
      escalationState: 'NONE',
      priorityLevel: incidentData.priorityLevel || 'HIGH',
      priorityScore: incidentData.priorityScore || 82,
      priorityBreakdown: incidentData.priorityBreakdown || {
        severity: 25,
        publicImpact: 18,
        vulnerability: 14,
        corroboration: 12,
        persistence: 5,
        locationContext: 8,
        totalScore: 82
      },
      location: incidentData.location || {
        lat: 28.4632,
        lng: 77.4912,
        address: 'Knowledge Park III, Greater Noida, UP',
        ward: 'Ward 12',
        landmark: 'Near Educational Corridor',
        isPublicSafePrecision: true
      },
      evidence: {
        beforePhotoUrl: incidentData.evidence?.beforePhotoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        photoTimestamp: formattedDate,
        gpsVerified: true,
        provenance: incidentData.evidence?.provenance || 'live_camera',
        hasVoiceNote: incidentData.evidence?.hasVoiceNote || false,
        voiceTranscript: incidentData.evidence?.voiceTranscript,
        deviceMetadata: {
          device: 'Citizen Device (GPS Verified)',
          accuracyMeters: 3.5,
          tamperCheckPassed: true,
          sha256Hash: 'f4d9a1c8e2b7...9921'
        }
      },
      aiMetadata: {
        classification: `${cat} / High Confidence`,
        confidence: 93,
        evidenceRelevance: 96,
        duplicateClusterProbability: 25,
        modelVersion: 'CivicVision Edge-v1.4b',
        suggestedDepartment: autoDept,
        suggestedWard: incidentData.location?.ward || 'Ward 12',
        reasonCodes: [
          'High visual evidence match with municipal civic defect models',
          'Geolocated inside municipal jurisdiction Ward 12'
        ]
      },
      linkedReports: [],
      communityConfirmations: 1,
      communityDisagreements: 0,
      averageImpactRating: 4.5,
      validationsList: [],
      department: autoDept,
      slaHoursRemaining: 72,
      isSlaAtRisk: false,
      progressPercent: 10,
      createdAt: formattedDate,
      updatedAt: formattedDate,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: formattedDate,
          actor: 'Citizen Reporter',
          role: 'Citizen',
          action: 'Complaint Submitted',
          details: `Complaint registered with photo evidence & GPS coordinates. Routed to ${autoDept}.`
        }
      ]
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    addNotification(
      'New Complaint Registered',
      `Complaint #${newIncident.id} (${newIncident.category}) submitted to ${autoDept}.`,
      newIncident.id,
      'verified'
    );

    // Sync with backend API
    apiClient.createIncident({
      title: newIncident.title,
      description: newIncident.description,
      category: newIncident.category as any,
      ward: newIncident.location.ward,
      address: newIncident.location.address,
      latitude: newIncident.location.lat,
      longitude: newIncident.location.lng,
      citizenName: 'Citizen Reporter',
      citizenPhone: '9876543210'
    });

    return newIncident;
  };

  // -------------------------------------------------------------
  // OFFICER LIFECYCLE ACTIONS (Section 2.B, 5, 6, 7)
  // -------------------------------------------------------------
  const approveIncident = (
    incidentId: string,
    workerId?: string,
    deadlineDays: number = 3,
    customDeadline?: string,
    notes?: string
  ) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const worker = workers.find((w) => w.id === workerId) || workers[0];
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    let targetDate = new Date();
    if (customDeadline) {
      const parsed = parseDeadline(customDeadline);
      if (parsed) targetDate = parsed;
    } else {
      targetDate.setDate(targetDate.getDate() + deadlineDays);
    }
    const deadlineStr = formatDeadlineDate(targetDate);

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newStatus: IncidentStatus = workerId ? 'ASSIGNED' : 'APPROVED';
        return {
          ...inc,
          status: newStatus,
          department: officer.department || inc.department,
          assignedWorker: workerId ? worker : inc.assignedWorker,
          deadline: deadlineStr,
          deadlineTimestamp: targetDate.getTime(),
          progressPercent: 25,
          officerNotes: notes || inc.officerNotes,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: workerId ? 'Complaint Approved & Squad Dispatched' : 'Complaint Approved for Execution',
              details: `Official approval granted. Deadline set to ${deadlineStr} (${deadlineDays} days). ${notes || ''}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Complaint Approved',
      `#${incidentId} approved by ${officer.name}. Target completion: ${deadlineStr}.`,
      incidentId,
      'assigned'
    );
  };

  const assignIncident = (
    incidentId: string,
    workerId: string,
    deadline: string,
    notes?: string
  ) => {
    approveIncident(incidentId, workerId, 3, deadline, notes);
  };

  const rejectIncident = (incidentId: string, reason: string) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'REJECTED',
          escalationState: 'REJECTED',
          rejectionReason: reason,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Complaint Rejected with Official Reason',
              details: `Ground inspection decision: ${reason}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Complaint Rejected by Officer',
      `#${incidentId} rejected: ${reason}`,
      incidentId,
      'officer_review'
    );
  };

  const requestMoreInfo = (incidentId: string, notes: string) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'MORE_INFO_REQUIRED',
          moreInfoNotes: notes,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Additional Information Requested',
              details: `Officer request: ${notes}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Information Requested for Complaint',
      `Officer Chauhan requested clarification on #${incidentId}: ${notes}`,
      incidentId,
      'officer_review'
    );
  };

  const overrideAiRecommendation = (
    incidentId: string,
    override: {
      category?: IncidentCategory;
      priorityLevel?: PriorityLevel;
      priorityScore?: number;
      department?: string;
      reason: string;
    }
  ) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          category: override.category || inc.category,
          priorityLevel: override.priorityLevel || inc.priorityLevel,
          priorityScore: override.priorityScore !== undefined ? override.priorityScore : inc.priorityScore,
          department: override.department || inc.department,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Manual Officer Override Applied',
              details: `Parameters adjusted: ${override.category ? `Category: ${override.category}; ` : ''}${override.priorityLevel ? `Priority: ${override.priorityLevel}; ` : ''}Justification: ${override.reason}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Officer Manual Override Applied',
      `#${incidentId} parameters adjusted: ${override.reason}`,
      incidentId,
      'officer_review'
    );
  };

  const extendDeadline = (incidentId: string, newDeadline: string, reason: string) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const parsed = parseDeadline(newDeadline);

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const extension: DeadlineExtension = {
          id: `ext-${Date.now()}`,
          previousDeadline: inc.deadline || 'Initial Deadline',
          newDeadline,
          reason,
          extendedBy: `${officer.name} (${officer.badgeNumber})`,
          timestamp: formattedDate
        };

        return {
          ...inc,
          deadline: newDeadline,
          deadlineTimestamp: parsed ? parsed.getTime() : inc.deadlineTimestamp,
          deadlineExtensions: [...(inc.deadlineExtensions || []), extension],
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Statutory Deadline Extended',
              details: `Deadline revised from ${inc.deadline} to ${newDeadline}. Justification: ${reason}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Deadline Extended with Audit Reason',
      `#${incidentId} deadline extended to ${newDeadline}: ${reason}`,
      incidentId,
      'deadline_alert'
    );
  };

  const updateProgressPercent = (incidentId: string, percent: number) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          progressPercent: percent
        };
      })
    );
  };

  // -------------------------------------------------------------
  // FIELD WORKER ACTIONS (Section 2.C & 8)
  // -------------------------------------------------------------
  const startWork = (incidentId: string) => {
    const worker = authenticatedWorker || workers[0];
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'WORK_STARTED',
          progressPercent: 50,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${worker.name} (${worker.team})`,
              role: 'Field Worker',
              action: 'Field Crew Checked In On-Site',
              details: 'Safety barriers deployed. Machinery & materials deployed on location.'
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Work Started On-Site',
      `${worker.name} started ground resolution for #${incidentId}.`,
      incidentId,
      'assigned'
    );
  };

  const updateWorkerTaskStatus = (
    incidentId: string,
    status: 'IN_PROGRESS' | 'ASSIGNED' | 'WORK_STARTED',
    notes?: string
  ) => {
    if (status === 'WORK_STARTED' || status === 'IN_PROGRESS') {
      startWork(incidentId);
    }
  };

  const submitRepairProof = (
    incidentId: string,
    afterPhotoUrl: string,
    workerNotes?: string,
    materialsLogged?: string
  ) => {
    const worker = authenticatedWorker || workers[0];
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'WORK_COMPLETED',
          progressPercent: 90,
          evidence: {
            ...inc.evidence,
            afterPhotoUrl
          },
          workerNotes: workerNotes || inc.workerNotes,
          materialsLogged: materialsLogged || inc.materialsLogged,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${worker.name} (${worker.team})`,
              role: 'Field Worker',
              action: 'Work Completed & Evidence Uploaded',
              details: `Completion photo registered. Notes: ${workerNotes || 'Physical defect rectified.'} Materials: ${materialsLogged || 'Standard materials'}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    addNotification(
      'Completion Evidence Uploaded by Field Crew',
      `${worker.name} completed repair for #${incidentId}. Awaiting Officer Verification.`,
      incidentId,
      'proof_submitted'
    );
  };

  const verifyCompletedWork = (incidentId: string, approved: boolean, notes?: string) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        if (approved) {
          return {
            ...inc,
            status: 'AWAITING_CITIZEN_FEEDBACK',
            progressPercent: 95,
            updatedAt: formattedDate,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: formattedDate,
                actor: `${officer.name} (${officer.badgeNumber})`,
                role: 'Municipal Officer',
                action: 'Officer Inspected & Approved Work Quality',
                details: `Physical resolution verified against initial evidence. Forwarded to citizen for confirmation. ${notes || ''}`
              },
              ...inc.auditLogs
            ]
          };
        } else {
          return {
            ...inc,
            status: 'WORK_STARTED',
            progressPercent: 60,
            updatedAt: formattedDate,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: formattedDate,
                actor: `${officer.name} (${officer.badgeNumber})`,
                role: 'Municipal Officer',
                action: 'Resolution Rejected / Re-Work Required',
                details: `Quality standards not met: ${notes || 'Re-work required on site.'}`
              },
              ...inc.auditLogs
            ]
          };
        }
      })
    );

    if (approved) {
      addNotification(
        'Officer Verified Work — Awaiting Citizen Feedback',
        `#${incidentId} verified by ${officer.name}. Citizen feedback requested.`,
        incidentId,
        'verified'
      );
    } else {
      addNotification(
        'Officer Rejected Work — Re-work Required',
        `#${incidentId} re-opened for rework by officer: ${notes || 'Correction needed'}`,
        incidentId,
        'reopened'
      );
    }
  };

  const approveRepairProof = (incidentId: string) => {
    verifyCompletedWork(incidentId, true, 'Visual inspection validated.');
  };

  // -------------------------------------------------------------
  // CITIZEN FEEDBACK & DISPUTE ACTIONS (Section 2.A)
  // -------------------------------------------------------------
  const citizenConfirmResolution = (
    incidentId: string,
    isSatisfied: boolean,
    rating: number = 5,
    comment?: string
  ) => {
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        if (isSatisfied) {
          try {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
          } catch {}

          return {
            ...inc,
            status: 'RESOLVED',
            progressPercent: 100,
            citizenFeedback: {
              isSatisfied: true,
              rating,
              comment,
              submittedAt: formattedDate
            },
            updatedAt: formattedDate,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: formattedDate,
                actor: 'Citizen Verified (Citizen Feedback)',
                role: 'Citizen',
                action: 'Resolution Confirmed — Ticket Closed',
                details: `Citizen confirmed issue is resolved. Satisfaction rating: ${rating}/5 stars. Feedback: "${comment || 'Satisfied with resolution'}"`
              },
              ...inc.auditLogs
            ]
          };
        } else {
          return {
            ...inc,
            status: 'REOPENED',
            escalationState: 'REOPENED',
            reopenReason: comment || 'Citizen reported issue is not resolved properly.',
            progressPercent: 60,
            updatedAt: formattedDate,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: formattedDate,
                actor: 'Citizen Disputed (Citizen Feedback)',
                role: 'Citizen',
                action: 'Resolution Disputed — Ticket Reopened',
                details: `Citizen flagged that completion evidence does not match ground reality. Reason: ${comment || 'Incomplete repair.'}`
              },
              ...inc.auditLogs
            ]
          };
        }
      })
    );

    addNotification(
      isSatisfied ? 'Citizen Confirmed Resolution' : 'Citizen Disputed Resolution',
      `#${incidentId}: ${isSatisfied ? 'Closed with citizen confirmation' : 'Reopened by citizen dispute'}`,
      incidentId,
      isSatisfied ? 'resolved' : 'reopened'
    );
  };

  const citizenDisputeResolution = (incidentId: string, reason: string) => {
    citizenConfirmResolution(incidentId, false, 1, reason);
  };

  const reopenIncident = (incidentId: string, reason: string, actorRole: 'Citizen' | 'Municipal Officer') => {
    if (actorRole === 'Citizen') {
      citizenDisputeResolution(incidentId, reason);
    } else {
      verifyCompletedWork(incidentId, false, reason);
    }
  };

  const votePublicValidation = (
    incidentId: string,
    action: 'confirmed_exists' | 'not_present_wrong_location',
    impactRating: number,
    comment?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const isConfirm = action === 'confirmed_exists';
        return {
          ...inc,
          communityConfirmations: inc.communityConfirmations + (isConfirm ? 1 : 0),
          communityDisagreements: inc.communityDisagreements + (isConfirm ? 0 : 1),
          userVote: isConfirm ? 'confirmed' : 'disputed'
        };
      })
    );
  };

  const toggleFollowIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return { ...inc, isFollowing: !inc.isFollowing };
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(NOTIFS_STORAGE_KEY);
    setIncidents(INITIAL_INCIDENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    apiClient.resetBackendDatabase();
  };

  return (
    <CivicContext.Provider
      value={{
        incidents,
        workers,
        hotspots,
        notifications,
        officerProfile: {
          ...DEFAULT_OFFICER_PROFILE,
          ...(authenticatedOfficer ? {
            name: authenticatedOfficer.name,
            badge_number: authenticatedOfficer.badgeNumber,
            department: authenticatedOfficer.department,
            designation: authenticatedOfficer.designation,
            zone: authenticatedOfficer.jurisdiction,
            email: authenticatedOfficer.email,
            phone: authenticatedOfficer.mobile
          } : {})
        },
        authenticatedOfficer,
        authenticatedWorker,
        isBackendOnline,
        currentRole,
        setCurrentRole,
        selectedIncident,
        setSelectedIncident,
        isReportModalOpen,
        setIsReportModalOpen,
        isAIVerifyModalOpen,
        setIsAIVerifyModalOpen,
        isApiExplorerOpen,
        setIsApiExplorerOpen,
        isOfficerProfileModalOpen,
        setIsOfficerProfileModalOpen,
        isOfficerAuthModalOpen,
        setIsOfficerAuthModalOpen,
        isWorkerAuthModalOpen,
        setIsWorkerAuthModalOpen,
        isMobileFrameActive,
        setIsMobileFrameActive,
        isSoundEnabled,
        setIsSoundEnabled,
        activeTab,
        setActiveTab,
        playSound,
        loginOfficer,
        registerOfficer,
        logoutOfficer,
        loginWorker,
        logoutWorker,
        createIncident,
        approveIncident,
        assignIncident,
        rejectIncident,
        requestMoreInfo,
        startWork,
        updateWorkerTaskStatus,
        submitRepairProof,
        verifyCompletedWork,
        approveRepairProof,
        extendDeadline,
        updateProgressPercent,
        overrideAiRecommendation,
        citizenConfirmResolution,
        citizenDisputeResolution,
        reopenIncident,
        votePublicValidation,
        toggleFollowIncident,
        markNotificationRead,
        resetToDefaultData
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = (): CivicContextType => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
