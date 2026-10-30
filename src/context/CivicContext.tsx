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
  id: 'OFF-YK-01',
  name: 'Yash Kumar',
  designation: 'Zonal Executive Officer & Infrastructure Superintendent',
  badge_number: 'GNIDA-EO-9761',
  department: 'Roads & Public Works Department',
  zone: 'Central City Zone (Wards 12, 14 & 15)',
  phone: '+91 9761003007',
  email: 'yash.kumar@pwd.delhi.gov.in',
  office_address: 'Municipal Zonal Headquarters, Sector Knowledge Park III, Greater Noida, UP - 201310',
  jurisdiction_wards: [
    'Ward 12 (Knowledge Park III)',
    'Ward 14 (Pari Chowk Junction)',
    'Ward 15 (Commercial Hub)'
  ],
  shift_status: 'Active On Duty — Zonal Triage Command',
  last_login: 'Today at 09:00 AM'
};

export const DEFAULT_OFFICER_ACCOUNT: OfficerAccount = {
  id: 'OFF-YK-01',
  name: 'Yash Kumar',
  mobile: '9761003007',
  email: 'yash.kumar@pwd.delhi.gov.in',
  department: 'Roads & Public Works Department',
  designation: 'Zonal Executive Officer & Infrastructure Superintendent',
  jurisdiction: 'Central City Zone (Wards 12, 14 & 15)',
  badgeNumber: 'GNIDA-EO-9761',
  isVerified: true,
  approvalStatus: 'APPROVED',
  createdAt: '2026-01-15T09:00:00Z',
  officeAddress: 'Municipal Zonal Headquarters, Sector Knowledge Park III, Greater Noida, UP - 201310'
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
  loginOfficer: (
    nameOrEmail: string,
    mobileOrPassword?: string,
    password?: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; message: string }>;
  changeOfficerPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
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
    notes?: string,
    overrideCategory?: IncidentCategory,
    overrideDept?: string
  ) => void;
  assignWorkerToIncident: (
    incidentId: string,
    workerId: string,
    deadline: string,
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
  startWork: (incidentId: string, notes?: string) => void;
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
    rating?: number,
    comment?: string
  ) => void;
  citizenDisputeResolution: (incidentId: string, reason: string) => void;
  reopenIncident: (incidentId: string, reason: string, actorRole?: 'Citizen' | 'Municipal Officer') => void;
  votePublicValidation: (
    incidentId: string,
    action: 'confirmed_exists' | 'not_present_wrong_location',
    impactRating: number,
    comment?: string
  ) => void;
  toggleFollowIncident: (incidentId: string) => void;
  markNotificationRead: (id: string) => void;
  resetToDefaultData: () => void;
  refreshIncidents: () => Promise<void>;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'civic_connect_incidents_v5';
const NOTIFS_STORAGE_KEY = 'civic_connect_notifs_v5';
const WORKER_STORAGE_KEY = 'civic_connect_worker_v5';

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<CivicIncident[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load local incidents, using defaults', e);
    }
    return INITIAL_INCIDENTS;
  });

  const [officerProfile] = useState<OfficerProfile>(DEFAULT_OFFICER_PROFILE);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [workers] = useState<WorkerInfo[]>(SAMPLE_WORKERS);
  const [hotspots] = useState<HotspotCluster[]>(SAMPLE_HOTSPOTS);

  // Officer Authentication State — persists in localStorage or sessionStorage when explicitly logged in
  const [authenticatedOfficer, setAuthenticatedOfficer] = useState<OfficerAccount | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('civic_officer_session') || sessionStorage.getItem('civic_officer_session');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load saved officer session', e);
      }
    }
    return null;
  });

  // Worker Authentication State
  const [authenticatedWorker, setAuthenticatedWorker] = useState<WorkerInfo | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(WORKER_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load saved worker', e);
      }
    }
    return SAMPLE_WORKERS[0] || null;
  });

  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/officer')) return 'officer';
      if (pathname.startsWith('/worker')) return 'worker';
      if (pathname.startsWith('/analytics')) return 'analytics';
      if (pathname.startsWith('/audit')) return 'audit';

      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['citizen', 'officer', 'worker', 'analytics', 'audit'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'citizen';
  });

  const [currentRole, setCurrentRole] = useState<'citizen' | 'officer' | 'worker'>('citizen');

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
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  // Persist Incidents
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.warn('Failed to save incidents', e);
    }
  }, [incidents]);

  // Persist Notifications
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  }, [notifications]);

  // Synchronize selectedIncident with fresh incidents state
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find((i) => i.id === selectedIncident.id);
      if (updated) setSelectedIncident(updated);
    }
  }, [incidents]);

  // Periodically synchronize with backend database
  const refreshIncidents = async () => {
    try {
      const data = await apiClient.getIncidents();
      if (data && Array.isArray(data) && data.length > 0) {
        setIncidents(data);
      }
    } catch {}
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        setIsBackendOnline(res.ok);
        if (res.ok) {
          refreshIncidents();
        }
      } catch {
        setIsBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
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
    // Clean audio player placeholder
  };

  // -------------------------------------------------------------
  // OFFICER AUTHENTICATION (Section 1)
  // -------------------------------------------------------------
  const loginOfficer = async (
    nameOrEmail: string,
    mobileOrPassword?: string,
    password?: string,
    rememberMe = false
  ): Promise<{ success: boolean; message: string }> => {
    let name = nameOrEmail.trim();
    let mobile = (mobileOrPassword || '').trim();
    let pass = (password || '').trim();

    if (!password && mobileOrPassword) {
      pass = mobileOrPassword;
      if (nameOrEmail.includes('@')) {
        mobile = '9761003007';
        name = 'Yash Kumar';
      } else {
        mobile = nameOrEmail;
        name = 'Yash Kumar';
      }
    }

    try {
      const res = await apiClient.officerLogin(name, mobile, pass, rememberMe);
      if (res && res.success && res.officer) {
        setAuthenticatedOfficer(res.officer);
        setCurrentRole('officer');
        if (rememberMe) {
          localStorage.setItem('civic_officer_session', JSON.stringify(res.officer));
        } else {
          sessionStorage.setItem('civic_officer_session', JSON.stringify(res.officer));
        }
        addNotification(
          'Officer Authentication Confirmed',
          `Welcome, ${res.officer.name}. Connected to ${res.officer.jurisdiction}.`,
          incidents[0]?.id || '',
          'officer_review'
        );
        return { success: true, message: `Welcome, ${res.officer.name}` };
      }
    } catch (err: any) {
      // Direct demo officer fallback for Yash Kumar
      const isYashName = name.toLowerCase() === 'yash kumar' || name.toLowerCase().includes('yash');
      const isYashMobile = mobile.replace(/\D/g, '') === '9761003007';
      const isYashPass = pass === 'yash@specify23';

      if (isYashName && isYashMobile && isYashPass) {
        const demoOfficer = DEFAULT_OFFICER_ACCOUNT;
        setAuthenticatedOfficer(demoOfficer);
        setCurrentRole('officer');
        if (rememberMe) {
          localStorage.setItem('civic_officer_session', JSON.stringify(demoOfficer));
        }
        addNotification(
          'Officer Authentication Confirmed',
          `Welcome back, Yash Kumar. Connected to ${demoOfficer.jurisdiction}.`,
          incidents[0]?.id || '',
          'officer_review'
        );
        return { success: true, message: 'Welcome, Yash Kumar' };
      }

      return {
        success: false,
        message: err.message || 'Invalid credentials. Please verify your Name, Mobile Number, and Password.'
      };
    }

    return { success: false, message: 'Invalid credentials. Verification failed.' };
  };

  const changeOfficerPassword = async (currentPass: string, newPass: string) => {
    const officerId = authenticatedOfficer?.id || DEFAULT_OFFICER_ACCOUNT.id;
    const res = await apiClient.officerChangePassword(officerId, currentPass, newPass);
    return { success: true, message: res.message || 'Password successfully updated.' };
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
    try {
      const res = await apiClient.officerRegister(data);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logoutOfficer = () => {
    setAuthenticatedOfficer(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civic_officer_session');
      sessionStorage.removeItem('civic_officer_session');
      window.history.pushState({}, '', '/officer/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setActiveTab('citizen');
    setCurrentRole('citizen');
  };

  // -------------------------------------------------------------
  // WORKER AUTHENTICATION
  // -------------------------------------------------------------
  const loginWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId) || workers[0];
    setAuthenticatedWorker(worker);
    setCurrentRole('worker');
    localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(worker));
    addNotification(
      'Field Crew Dispatch Activated',
      `Welcome ${worker.name}. Squad: ${worker.team}.`,
      incidents[0]?.id || '',
      'assigned'
    );
  };

  const logoutWorker = () => {
    setAuthenticatedWorker(null);
    localStorage.removeItem(WORKER_STORAGE_KEY);
    setActiveTab('citizen');
    setCurrentRole('citizen');
  };

  // -------------------------------------------------------------
  // CITIZEN ACTIONS: CREATE REPORT
  // -------------------------------------------------------------
  const createIncident = (incidentData: Partial<CivicIncident>): CivicIncident => {
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const cat = incidentData.category || 'Pothole';

    const newIncident: CivicIncident = {
      id: `CC-${1040 + incidents.length + 1}`,
      title: incidentData.title || `Reported ${cat}: ${incidentData.location?.landmark || incidentData.location?.address?.slice(0, 32) || 'Roadway Defect'}`,
      description: incidentData.description || 'Public infrastructure issue reported with live photographic proof.',
      category: cat,
      status: 'UNDER_REVIEW', // Automatically appears under Under Review
      escalationState: 'NONE',
      priorityLevel: incidentData.priorityLevel || 'HIGH',
      priorityScore: incidentData.priorityScore || 82,
      priorityBreakdown: incidentData.priorityBreakdown || {
        severity: 24,
        publicImpact: 18,
        vulnerability: 14,
        corroboration: 12,
        persistence: 6,
        locationContext: 8,
        totalScore: 82
      },
      location: incidentData.location || {
        lat: 0,
        lng: 0,
        address: 'Location not specified',
        ward: 'Ward Unassigned',
        landmark: '',
        isPublicSafePrecision: true
      },
      evidence: incidentData.evidence || {
        beforePhotoUrl: '',
        photoTimestamp: formattedDate,
        gpsVerified: false,
        provenance: 'live_camera'
      },
      aiMetadata: incidentData.aiMetadata || {
        classification: `${cat} / High Confidence`,
        confidence: 94.0,
        evidenceRelevance: 98.0,
        duplicateClusterProbability: 12.0,
        modelVersion: 'CivicVision-v1.4b',
        suggestedDepartment: 'Roads & Public Works Department',
        suggestedWard: incidentData.location?.ward || 'Ward 12',
        reasonCodes: ['Visual defect matches standard municipal hazard profile']
      },
      linkedReports: [],
      communityConfirmations: 1,
      communityDisagreements: 0,
      averageImpactRating: 4.5,
      validationsList: [],
      department: incidentData.department || 'Roads & Public Works Department',
      slaHoursRemaining: 24,
      isSlaAtRisk: false,
      progressPercent: 10,
      createdAt: formattedDate,
      updatedAt: formattedDate,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: formattedDate,
          actor: 'Citizen (Web Portal)',
          role: 'Citizen',
          action: 'Report Submitted',
          details: `Geotagged report submitted at ${incidentData.location?.address || 'Knowledge Park III'}.`
        },
        {
          id: `log-${Date.now() + 1}`,
          timestamp: formattedDate,
          actor: 'AI Vision Pipeline',
          role: 'AI System (v1.4b)',
          action: 'AI Issue Categorized & Routed',
          details: `Automatic categorization: ${cat} (94% confidence). Forwarded to ${incidentData.department || 'Roads & Public Works'}.`
        }
      ]
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // Send to backend
    apiClient.createIncident({
      title: newIncident.title,
      description: newIncident.description,
      category: newIncident.category,
      ward: newIncident.location.ward,
      address: newIncident.location.address,
      latitude: newIncident.location.lat,
      longitude: newIncident.location.lng,
      landmark: newIncident.location.landmark,
      beforePhotoUrl: newIncident.evidence.beforePhotoUrl,
      provenance: newIncident.evidence.provenance
    });

    addNotification(
      'New Complaint Received',
      `Complaint #${newIncident.id} (${cat}) logged in ${newIncident.location.ward}. Awaiting Officer Review.`,
      newIncident.id,
      'officer_review'
    );

    return newIncident;
  };

  // -------------------------------------------------------------
  // OFFICER LIFECYCLE ACTIONS (Section 3, 4, 6)
  // -------------------------------------------------------------
  const approveIncident = (
    incidentId: string,
    notes?: string,
    overrideCategory?: IncidentCategory,
    overrideDept?: string
  ) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'APPROVED',
          category: overrideCategory || inc.category,
          department: overrideDept || officer.department || inc.department,
          officerNotes: notes || inc.officerNotes,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Complaint Approved',
              details: `Official approval granted by Officer ${officer.name}. Now available for field worker assignment.`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.approveIncident(incidentId, notes, overrideCategory, overrideDept);

    addNotification(
      'Complaint Approved by Officer',
      `#${incidentId} approved by ${officer.name}. Ready for worker assignment.`,
      incidentId,
      'officer_review'
    );
  };

  const assignWorkerToIncident = (
    incidentId: string,
    workerId: string,
    deadline: string,
    notes?: string
  ) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const worker = workers.find((w) => w.id === workerId) || workers[0];
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const targetDate = parseDeadline(deadline) || new Date(Date.now() + 3 * 86400000);
    const deadlineStr = formatDeadlineDate(targetDate);

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'ASSIGNED',
          assignedWorker: worker,
          deadline: deadlineStr,
          deadlineTimestamp: targetDate.getTime(),
          officerNotes: notes || inc.officerNotes,
          progressPercent: 30,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Field Worker Assigned',
              details: `Dispatched to ${worker.name} (${worker.team}, Ph: ${worker.phone}). Target completion: ${deadlineStr}. Notes: ${notes || 'Standard SOP repair.'}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.assignIncident(incidentId, worker.id, deadlineStr, notes);

    addNotification(
      'Field Crew Dispatched',
      `#${incidentId} assigned to ${worker.name}. Target deadline: ${deadlineStr}.`,
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
    assignWorkerToIncident(incidentId, workerId, deadline, notes);
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
              action: 'Complaint Rejected with Mandatory Reason',
              details: `Official rejection decision by ${officer.name}. Ground reason: "${reason}"`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.rejectIncident(incidentId, reason);

    addNotification(
      'Complaint Rejected by Officer',
      `#${incidentId} rejected. Reason: ${reason}`,
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
              details: `Clarification requested: "${notes}"`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.requestMoreInfo(incidentId, notes);

    addNotification(
      'Information Requested for Complaint',
      `Officer ${officer.name} requested clarification on #${incidentId}: ${notes}`,
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
          priorityScore: override.priorityScore ?? inc.priorityScore,
          department: override.department || inc.department,
          officerNotes: `Override Reason: ${override.reason}`,
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Officer Manual Override',
              details: `Official override: ${override.reason}. Category: ${override.category || inc.category}, Dept: ${override.department || inc.department}.`
            },
            ...inc.auditLogs
          ]
        };
      })
    );
  };

  const extendDeadline = (incidentId: string, newDeadline: string, reason: string) => {
    const officer = authenticatedOfficer || DEFAULT_OFFICER_ACCOUNT;
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const prevDeadline = inc.deadline || 'Initial Target';
        const newExt: DeadlineExtension = {
          id: `ext-${Date.now()}`,
          previousDeadline: prevDeadline,
          newDeadline,
          reason,
          extendedBy: `${officer.name} (${officer.badgeNumber})`,
          timestamp: formattedDate
        };

        return {
          ...inc,
          deadline: newDeadline,
          deadlineExtensions: [...(inc.deadlineExtensions || []), newExt],
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${officer.name} (${officer.badgeNumber})`,
              role: 'Municipal Officer',
              action: 'Statutory Deadline Extended',
              details: `Deadline revised from ${prevDeadline} to ${newDeadline}. Official reason: ${reason}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.extendDeadline(incidentId, newDeadline, reason);

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
        return { ...inc, progressPercent: percent };
      })
    );
  };

  // -------------------------------------------------------------
  // FIELD WORKER ACTIONS (Section 5)
  // -------------------------------------------------------------
  const startWork = (incidentId: string, notes?: string) => {
    const worker = authenticatedWorker || workers[0];
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'WORK_STARTED',
          progressPercent: 55,
          workerNotes: notes || 'Technician checked in on-site. Field repair work started.',
          updatedAt: formattedDate,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: formattedDate,
              actor: `${worker.name} (${worker.team})`,
              role: 'Field Worker',
              action: 'Work Started On-Site',
              details: notes || 'Technician deployed on location. Barricades erected and repair started.'
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.updateWorkerStatus(incidentId, 'WORK_STARTED', notes);

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
      startWork(incidentId, notes);
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
              action: 'Completion Photo Submitted',
              details: `After-photo uploaded. Notes: ${workerNotes || 'Repairs completed.'} Materials: ${materialsLogged || 'Standard materials'}`
            },
            ...inc.auditLogs
          ]
        };
      })
    );

    apiClient.submitWorkerCompletion(incidentId, afterPhotoUrl, workerNotes, materialsLogged);

    addNotification(
      'Work Completed — Awaiting Officer Verification',
      `${worker.name} submitted completion photo for #${incidentId}. Verification required.`,
      incidentId,
      'proof_submitted'
    );
  };

  // -------------------------------------------------------------
  // OFFICER VERIFICATION (Section 6)
  // -------------------------------------------------------------
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
                action: 'Officer Verified Completed Work',
                details: `Physical resolution verified against initial problem photo. Before/after photos made available for public transparency. Forwarded for citizen feedback. ${notes || ''}`
              },
              ...inc.auditLogs
            ]
          };
        } else {
          return {
            ...inc,
            status: 'WORK_STARTED',
            escalationState: 'REOPENED',
            progressPercent: 60,
            officerNotes: `Rework Required: ${notes || 'Quality standards not met.'}`,
            updatedAt: formattedDate,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: formattedDate,
                actor: `${officer.name} (${officer.badgeNumber})`,
                role: 'Municipal Officer',
                action: 'Completion Evidence Rejected / Rework Ordered',
                details: `Officer ordered rework: ${notes || 'Ground inspection identified lingering defects.'}`
              },
              ...inc.auditLogs
            ]
          };
        }
      })
    );

    apiClient.verifyCompletedWork(incidentId, approved ? 'approve' : 'reject', notes);

    if (approved) {
      addNotification(
        'Officer Verified Work — Citizen Feedback Enabled',
        `#${incidentId} verified by Officer ${officer.name}. Citizen feedback requested.`,
        incidentId,
        'verified'
      );
    } else {
      addNotification(
        'Officer Ordered Rework',
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
  // CITIZEN FEEDBACK & AUTOMATIC RESOLUTION (Section 8)
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
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {}

          return {
            ...inc,
            status: 'RESOLVED',
            progressPercent: 100,
            userVote: 'resolved',
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
                action: 'Citizen Final Verification Passed — Complaint Resolved',
                details: `Citizen confirmed issue is resolved. Satisfaction: ${rating}/5 stars. Feedback: "${comment || 'Fully resolved on ground.'}"`
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
            citizenFeedback: {
              isSatisfied: false,
              rating,
              comment,
              submittedAt: formattedDate
            },
            updatedAt: formattedDate,
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                timestamp: formattedDate,
                actor: 'Citizen Disputed (Citizen Feedback)',
                role: 'Citizen',
                action: 'Citizen Disputed Work — Complaint Reopened',
                details: `Citizen flagged that completion evidence does not match ground reality. Reason: "${comment || 'Unresolved defect.'}"`
              },
              ...inc.auditLogs
            ]
          };
        }
      })
    );

    apiClient.citizenClosureFeedback(incidentId, isSatisfied, rating, comment);

    addNotification(
      isSatisfied ? 'Complaint Officially Resolved' : 'Complaint Disputed by Citizen',
      `#${incidentId}: ${isSatisfied ? 'Resolved with citizen confirmation ★★★★★' : 'Reopened by citizen dispute for additional crew work'}`,
      incidentId,
      isSatisfied ? 'resolved' : 'reopened'
    );
  };

  const citizenDisputeResolution = (incidentId: string, reason: string) => {
    citizenConfirmResolution(incidentId, false, 1, reason);
  };

  const reopenIncident = (incidentId: string, reason: string, actorRole: 'Citizen' | 'Municipal Officer' = 'Citizen') => {
    citizenConfirmResolution(incidentId, false, 1, reason);
  };

  const votePublicValidation = (
    incidentId: string,
    action: 'confirmed_exists' | 'not_present_wrong_location',
    impactRating: number,
    comment?: string
  ) => {
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const newConf = action === 'confirmed_exists' ? inc.communityConfirmations + 1 : inc.communityConfirmations;
        const newDis = action === 'not_present_wrong_location' ? inc.communityDisagreements + 1 : inc.communityDisagreements;

        const newValidation = {
          id: `val-${Date.now()}`,
          userIdMasked: 'Verified Citizen (Ward Resident)',
          action,
          impactRating,
          comment,
          timestamp: formattedDate
        };

        const validations = [newValidation, ...(inc.validationsList || [])];
        const ratings = validations.map((v) => v.impactRating).filter((r) => r > 0);
        const avgImpact = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : inc.averageImpactRating;

        return {
          ...inc,
          communityConfirmations: newConf,
          communityDisagreements: newDis,
          averageImpactRating: avgImpact,
          validationsList: validations,
          updatedAt: formattedDate
        };
      })
    );

    apiClient.validateIncident(incidentId, action, impactRating, comment);
  };

  const toggleFollowIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const isF = !inc.isFollowing;
        return { ...inc, isFollowing: isF };
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
    localStorage.removeItem('civic_officer_session');
    setIncidents(INITIAL_INCIDENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuthenticatedOfficer(null);
    apiClient.resetBackendDatabase();
  };

  return (
    <CivicContext.Provider
      value={{
        incidents,
        workers,
        hotspots,
        notifications,
        officerProfile,
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
        changeOfficerPassword,
        registerOfficer,
        logoutOfficer,
        loginWorker,
        logoutWorker,
        createIncident,
        approveIncident,
        assignWorkerToIncident,
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
        resetToDefaultData,
        refreshIncidents
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
