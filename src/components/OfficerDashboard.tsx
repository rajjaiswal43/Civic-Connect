import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { CivicMap } from './CivicMap';
import { PriorityScoreExplainer } from './PriorityScoreExplainer';
import { DuplicateClusterVisualizer } from './DuplicateClusterVisualizer';
import { CivicIncident, IncidentCategory, PriorityLevel, WorkerInfo } from '../types';
import { SAMPLE_DEPARTMENTS, GREATER_NOIDA_WARDS } from '../data/seedData';
import { getDeadlineCountdown, formatDeadlineDate, parseDeadline } from '../utils/deadlines';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  HardHat,
  MapPin,
  Flame,
  ArrowRight,
  ShieldAlert,
  Send,
  UserCheck,
  ShieldCheck,
  Sliders,
  Layers,
  AlertCircle,
  Calendar,
  XCircle,
  HelpCircle,
  Check,
  X,
  FileText,
  Bell,
  Eye,
  CalendarPlus,
  RefreshCw,
  TrendingUp,
  Award,
  LogOut,
  Phone,
  KeyRound,
  RotateCcw,
  CheckSquare
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const {
    incidents,
    hotspots,
    selectedIncident,
    setSelectedIncident,
    approveIncident,
    assignWorkerToIncident,
    rejectIncident,
    requestMoreInfo,
    extendDeadline,
    verifyCompletedWork,
    workers,
    officerProfile,
    authenticatedOfficer,
    setIsOfficerProfileModalOpen,
    notifications,
    logoutOfficer,
    changeOfficerPassword,
    refreshIncidents,
    playSound
  } = useCivic();

  // Active Section Tab (10 distinct sections requested in Section 2)
  // 'overview' | 'new' | 'approved' | 'assigned' | 'work_in_progress' | 'pending' | 'awaiting_verification' | 'resolved' | 'notifications'
  const [sectionTab, setSectionTab] = useState<
    'overview' | 'new' | 'approved' | 'assigned' | 'work_in_progress' | 'pending' | 'awaiting_verification' | 'resolved' | 'notifications'
  >('overview');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [filterMyJurisdictionOnly, setFilterMyJurisdictionOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'deadline'>('priority');

  // Modal States
  const [assigningIncident, setAssigningIncident] = useState<CivicIncident | null>(null);
  const [rejectingIncident, setRejectingIncident] = useState<CivicIncident | null>(null);
  const [requestingInfoIncident, setRequestingInfoIncident] = useState<CivicIncident | null>(null);
  const [extendingDeadlineIncident, setExtendingDeadlineIncident] = useState<CivicIncident | null>(null);
  const [verifyingIncident, setVerifyingIncident] = useState<CivicIncident | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

  // Form Inputs for Modals
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || 'w-1');
  const [deadlineDays, setDeadlineDays] = useState<number>(3);
  const [customDeadlineDate, setCustomDeadlineDate] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('Rapid response squad dispatched with standard equipment.');
  const [assignmentConfirmed, setAssignmentConfirmed] = useState<boolean>(false);

  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [moreInfoText, setMoreInfoText] = useState<string>('');
  const [extensionNewDeadline, setExtensionNewDeadline] = useState<string>('');
  const [extensionReasonText, setExtensionReasonText] = useState<string>('');
  const [verificationNotes, setVerificationNotes] = useState<string>('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Active Officer Profile
  const activeOfficer = authenticatedOfficer || {
    name: 'Yash Kumar',
    badgeNumber: 'GNIDA-EO-9761',
    department: 'Roads & Public Works Department',
    designation: 'Zonal Executive Officer & Infrastructure Superintendent',
    jurisdiction: 'Central City Zone (Wards 12, 14 & 15)'
  };

  // -------------------------------------------------------------
  // LIVE DATABASE STATISTICS (Section 2 - strictly computed from records)
  // -------------------------------------------------------------
  const totalComplaintsCount = incidents.length;
  const underReviewComplaints = incidents.filter(
    (i) => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW' || i.status === 'AI_CHECK'
  );
  const approvedComplaints = incidents.filter(
    (i) => i.status === 'APPROVED' || i.status === 'VERIFIED'
  );
  const assignedComplaints = incidents.filter(
    (i) => i.status === 'ASSIGNED'
  );
  const workStartedComplaints = incidents.filter(
    (i) => i.status === 'WORK_STARTED' || i.status === 'IN_PROGRESS'
  );
  const workCompletedComplaints = incidents.filter(
    (i) => i.status === 'WORK_COMPLETED'
  );
  const awaitingVerificationComplaints = incidents.filter(
    (i) => i.status === 'WORK_COMPLETED' || i.status === 'OFFICER_VERIFICATION'
  );
  const resolvedComplaints = incidents.filter(
    (i) => i.status === 'RESOLVED'
  );
  const overdueComplaints = incidents.filter((i) => {
    if (i.status === 'RESOLVED' || i.status === 'REJECTED') return false;
    const cd = getDeadlineCountdown(i.deadline, i.deadlineTimestamp);
    return cd.isOverdue || i.escalationState === 'OVERDUE';
  });

  // Filtered List based on Active Section Tab
  const filteredIncidents = incidents.filter((inc) => {
    // Jurisdiction Filter
    if (filterMyJurisdictionOnly && activeOfficer.jurisdiction) {
      const matchWard = activeOfficer.jurisdiction.toLowerCase().includes(inc.location.ward.toLowerCase());
      const matchDept = activeOfficer.department ? inc.department.toLowerCase().includes(activeOfficer.department.toLowerCase().split(' ')[0]) : true;
      if (!matchWard && !matchDept) return false;
    }

    // Section Filters
    if (sectionTab === 'new') {
      if (inc.status !== 'SUBMITTED' && inc.status !== 'UNDER_REVIEW' && inc.status !== 'AI_CHECK') return false;
    } else if (sectionTab === 'approved') {
      if (inc.status !== 'APPROVED') return false;
    } else if (sectionTab === 'assigned') {
      if (inc.status !== 'ASSIGNED') return false;
    } else if (sectionTab === 'work_in_progress') {
      if (inc.status !== 'WORK_STARTED' && inc.status !== 'IN_PROGRESS') return false;
    } else if (sectionTab === 'pending') {
      if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return false;
      if (inc.status !== 'ASSIGNED' && inc.status !== 'WORK_STARTED' && inc.status !== 'IN_PROGRESS' && inc.status !== 'APPROVED') return false;
    } else if (sectionTab === 'awaiting_verification') {
      if (inc.status !== 'WORK_COMPLETED' && inc.status !== 'OFFICER_VERIFICATION') return false;
    } else if (sectionTab === 'resolved') {
      if (inc.status !== 'RESOLVED' && inc.status !== 'AWAITING_CITIZEN_FEEDBACK') return false;
    }

    // Category & Ward Filters
    const matchesCategory = categoryFilter === 'ALL' || inc.category === categoryFilter;
    const matchesWard = wardFilter === 'ALL' || inc.location.ward === wardFilter;
    const matchesSearch =
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesWard && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
    if (sortBy === 'deadline') {
      const ta = a.deadlineTimestamp || (parseDeadline(a.deadline)?.getTime() || 0);
      const tb = b.deadlineTimestamp || (parseDeadline(b.deadline)?.getTime() || 0);
      return ta - tb;
    }
    return 0;
  });

  // Action Handlers
  const handleApproveOnly = (inc: CivicIncident) => {
    approveIncident(inc.id, 'Complaint verified on jurisdiction maps and approved for dispatch.');
    playSound('success');
  };

  const handleOpenAssignModal = (inc: CivicIncident) => {
    setAssigningIncident(inc);
    setSelectedWorkerId(workers[0]?.id || 'w-1');
    setDeadlineDays(3);
    setAssignmentNotes('Standard rapid response dispatch squad.');
    setAssignmentConfirmed(false);
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningIncident || !assignmentConfirmed) return;

    let targetDeadline = customDeadlineDate;
    if (!targetDeadline) {
      const d = new Date();
      d.setDate(d.getDate() + deadlineDays);
      targetDeadline = formatDeadlineDate(d);
    }

    assignWorkerToIncident(
      assigningIncident.id,
      selectedWorkerId,
      targetDeadline,
      assignmentNotes
    );
    playSound('success');
    setAssigningIncident(null);
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingIncident || !rejectionReasonText.trim()) return;

    rejectIncident(rejectingIncident.id, rejectionReasonText.trim());
    playSound('alert');
    setRejectingIncident(null);
    setRejectionReasonText('');
  };

  const handleConfirmMoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingInfoIncident || !moreInfoText.trim()) return;

    requestMoreInfo(requestingInfoIncident.id, moreInfoText.trim());
    playSound('click');
    setRequestingInfoIncident(null);
    setMoreInfoText('');
  };

  const handleConfirmDeadlineExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingDeadlineIncident || !extensionNewDeadline.trim() || !extensionReasonText.trim()) return;

    extendDeadline(extendingDeadlineIncident.id, extensionNewDeadline.trim(), extensionReasonText.trim());
    playSound('success');
    setExtendingDeadlineIncident(null);
    setExtensionNewDeadline('');
    setExtensionReasonText('');
  };

  const handleVerifyCompletedWorkAction = (incidentId: string, action: 'approve' | 'reject' | 'request_rework') => {
    if (action === 'approve') {
      verifyCompletedWork(incidentId, true, verificationNotes || 'Officer verified satisfactory completion.');
      playSound('success');
    } else {
      verifyCompletedWork(incidentId, false, verificationNotes || 'Deficiencies noted in ground repair. Rework ordered.');
      playSound('alert');
    }
    setVerifyingIncident(null);
    setVerificationNotes('');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeStatus({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeStatus({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      const res = await changeOfficerPassword(currentPassword, newPassword);
      setPasswordChangeStatus(res);
      if (res.success) {
        playSound('success');
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setPasswordChangeStatus(null);
        }, 1200);
      }
    } catch (err: any) {
      setPasswordChangeStatus({ success: false, message: err.message || 'Failed to update password.' });
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ---------------------------------------------------------
          TOP HEADER: Welcome, Yash Kumar & Officer Command Centre (Section 2)
         --------------------------------------------------------- */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091e3a, #132f57, #1e3a8a)',
          color: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
              flexShrink: 0
            }}
          >
            YK
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--white)', margin: 0, letterSpacing: '-0.02em' }}>
                Welcome, {activeOfficer.name}
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid rgba(147, 197, 253, 0.3)' }}>
                Badge: {activeOfficer.badgeNumber}
              </span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '3px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                Authorized Municipal Signatory ✓
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginTop: '4px' }}>
              Officer Command Centre
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '6px', fontSize: '0.78rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
              <span>🏢 <strong>Department:</strong> {activeOfficer.department}</span>
              <span>📍 <strong>Assigned Jurisdiction:</strong> {activeOfficer.jurisdiction}</span>
              <span>🛡️ <strong>Statutory Authority:</strong> UP Municipal Corporation Act §112</span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons: Password & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'var(--white)',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Change Official Officer Password"
          >
            <KeyRound size={13} />
            <span>Change Password</span>
          </button>

          <button
            onClick={logoutOfficer}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Log out of Officer Portal"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          10 DEDICATED SECTIONS TABS NAVIGATION (Section 2)
         --------------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          background: 'var(--white)',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          overflowX: 'auto',
          gap: '4px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <button
          className={`nav-tab-btn ${sectionTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSectionTab('overview')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
        >
          <TrendingUp size={14} />
          <span>1. Overview ({totalComplaintsCount})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'new' ? 'active' : ''}`}
          onClick={() => setSectionTab('new')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', color: sectionTab === 'new' ? 'var(--white)' : '#d97706', whiteSpace: 'nowrap' }}
        >
          <AlertCircle size={14} />
          <span>2. Under Review ({underReviewComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'approved' ? 'active' : ''}`}
          onClick={() => setSectionTab('approved')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
        >
          <CheckCircle2 size={14} />
          <span>3. Approved ({approvedComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setSectionTab('assigned')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
        >
          <UserCheck size={14} />
          <span>4. Assigned Workers ({assignedComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'work_in_progress' ? 'active' : ''}`}
          onClick={() => setSectionTab('work_in_progress')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
        >
          <HardHat size={14} />
          <span>5. Work in Progress ({workStartedComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'pending' ? 'active' : ''}`}
          onClick={() => setSectionTab('pending')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', color: sectionTab === 'pending' ? 'var(--white)' : '#d97706', whiteSpace: 'nowrap' }}
        >
          <Clock size={14} />
          <span>6. Pending Work ({inProgressComplaintsApproaching(incidents).length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'awaiting_verification' ? 'active' : ''}`}
          onClick={() => setSectionTab('awaiting_verification')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', color: sectionTab === 'awaiting_verification' ? 'var(--white)' : '#ea580c', whiteSpace: 'nowrap' }}
        >
          <ShieldAlert size={14} />
          <span>7. Awaiting Verification ({awaitingVerificationComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'resolved' ? 'active' : ''}`}
          onClick={() => setSectionTab('resolved')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', color: sectionTab === 'resolved' ? 'var(--white)' : '#059669', whiteSpace: 'nowrap' }}
        >
          <Award size={14} />
          <span>8. Resolved ({resolvedComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setSectionTab('notifications')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
        >
          <Bell size={14} />
          <span>9. Notifications ({notifications.filter((n) => n.unread).length})</span>
        </button>

        <button
          onClick={logoutOfficer}
          style={{
            padding: '0.55rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            whiteSpace: 'nowrap',
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <LogOut size={14} />
          <span>10. Logout</span>
        </button>
      </div>

      {/* ---------------------------------------------------------
          SECTION 1: DASHBOARD OVERVIEW — LIVE STATS (Section 2)
         --------------------------------------------------------- */}
      {sectionTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {/* Stat 1: Total complaints received */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Total Received
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px', margin: 0 }}>
                {totalComplaintsCount}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)' }}>Live complaints</span>
            </div>

            {/* Stat 2: Under Review */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fde68a', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                Under Review
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '2px', margin: 0 }}>
                {underReviewComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#b45309' }}>Awaiting Approval</span>
            </div>

            {/* Stat 3: Approved */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--civic-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--civic-700)', textTransform: 'uppercase' }}>
                Approved
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--civic-600)', marginTop: '2px', margin: 0 }}>
                {approvedComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>Ready for crew</span>
            </div>

            {/* Stat 4: Workers Assigned */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #c7d2fe', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>
                Workers Assigned
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px', margin: 0 }}>
                {assignedComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#4338ca' }}>Squads dispatched</span>
            </div>

            {/* Stat 5: Work Started */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #bfdbfe', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                Work Started
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '2px', margin: 0 }}>
                {workStartedComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#1d4ed8' }}>Crews on-site</span>
            </div>

            {/* Stat 6: Work Completed */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fed7aa', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                Work Completed
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', marginTop: '2px', margin: 0 }}>
                {workCompletedComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#c2410c' }}>Photos uploaded</span>
            </div>

            {/* Stat 7: Awaiting Verification */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fbcfe8', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#be185d', textTransform: 'uppercase' }}>
                Awaiting Verify
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#db2777', marginTop: '2px', margin: 0 }}>
                {awaitingVerificationComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#be185d' }}>Quality check</span>
            </div>

            {/* Stat 8: Resolved */}
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--emerald-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--emerald-700)', textTransform: 'uppercase' }}>
                Resolved
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '2px', margin: 0 }}>
                {resolvedComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#059669' }}>Citizen verified ✓</span>
            </div>

            {/* Stat 9: Overdue */}
            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
                Overdue
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '2px', margin: 0 }}>
                {overdueComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#b91c1c' }}>Past deadline</span>
            </div>
          </div>

          {/* GIS Operations Map */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Building2 size={18} style={{ color: 'var(--civic-600)' }} />
                  Jurisdiction GIS Operations Radar
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Active complaints geofenced in {activeOfficer.jurisdiction}
                </p>
              </div>
            </div>
            <div style={{ padding: '0.75rem' }}>
              <CivicMap
                incidents={filteredIncidents}
                hotspots={hotspots}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                height="380px"
              />
            </div>
          </div>
        </>
      )}

      {/* ---------------------------------------------------------
          FILTER & SEARCH TOOLBAR
         --------------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--white)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
          <input
            type="text"
            placeholder="Search complaint ID, issue title, ward or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.8rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.78rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Pothole">Potholes & Roads</option>
            <option value="Garbage">Garbage & Sanitation</option>
            <option value="Streetlight">Streetlights & Electrical</option>
            <option value="Water Leakage">Water Supply & Leakages</option>
            <option value="Drainage">Drainage & Sewerage</option>
            <option value="Footpath">Broken Footpaths</option>
            <option value="Public Asset">Public Property Damage</option>
            <option value="Open Manhole">Open Manholes</option>
            <option value="Traffic Sign">Traffic Signs</option>
          </select>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.78rem' }}
          >
            <option value="ALL">All Wards</option>
            {GREATER_NOIDA_WARDS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.78rem' }}
          >
            <option value="priority">Sort by Priority (Score)</option>
            <option value="deadline">Sort by Deadline Urgency</option>
          </select>

          <button
            onClick={() => refreshIncidents()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
            title="Refresh database records"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          SECTION 9: NOTIFICATIONS STREAM
         --------------------------------------------------------- */}
      {sectionTab === 'notifications' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bell size={18} style={{ color: 'var(--civic-600)' }} />
              Officer Notifications & Real-Time Alerts
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                No notifications logged yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    const inc = incidents.find((i) => i.id === n.incidentId);
                    if (inc) setSelectedIncident(inc);
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: n.unread ? '1px solid var(--civic-200)' : '1px solid var(--slate-200)',
                    background: n.unread ? 'var(--civic-50)' : 'var(--slate-50)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--slate-900)' }}>{n.title}</strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', margin: '2px 0 0 0' }}>{n.message}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)', flexShrink: 0 }}>{n.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          SECTION 7: WORK COMPLETED — AWAITING VERIFICATION (Side-by-Side Comparison)
         --------------------------------------------------------- */}
      {sectionTab === 'awaiting_verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                Work Completed — Awaiting Officer Quality Verification
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', margin: '2px 0 0 0' }}>
                Compare original complaint evidence with the field technician's completion photo before approving public release and citizen sign-off.
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-600)' }}>
              {awaitingVerificationComplaints.length} tickets pending review
            </span>
          </div>

          {awaitingVerificationComplaints.length === 0 ? (
            <div style={{ background: 'var(--white)', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--slate-200)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--emerald-600)', margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                No Completed Work Awaiting Verification
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                All completed work orders have been inspected, approved, and forwarded for citizen feedback.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {awaitingVerificationComplaints.map((inc) => (
                <div
                  key={inc.id}
                  className="card"
                  style={{
                    border: '2px solid #fed7aa',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-xl)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--civic-700)', background: 'var(--civic-50)', padding: '2px 8px', borderRadius: '4px' }}>
                        #{inc.id}
                      </span>
                      <span className="badge badge-warning">
                        COMPLETION PROOF SUBMITTED
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                        {inc.category} • {inc.location.ward}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Updated: {inc.updatedAt}
                    </span>
                  </div>

                  {/* SIDE-BY-SIDE BEFORE / AFTER COMPARISON (Section 6) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    {/* LEFT SIDE: Original Problem Photo */}
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
                          LEFT: Original Problem Photo (Citizen)
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>
                          {inc.evidence.photoTimestamp}
                        </span>
                      </div>
                      <img
                        src={inc.evidence.beforePhotoUrl}
                        alt="Original Issue"
                        style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', margin: '6px 0 0 0', lineHeight: 1.35 }}>
                        <strong>Reported Problem:</strong> {inc.description}
                      </p>
                    </div>

                    {/* RIGHT SIDE: Worker Completion Photo */}
                    <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                          RIGHT: Worker Completion Photo (On-Site)
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
                          Geo-Verified Ground Proof ✓
                        </span>
                      </div>
                      <img
                        src={inc.evidence.afterPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'}
                        alt="Completed Work"
                        style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                      <p style={{ fontSize: '0.75rem', color: '#166534', margin: '6px 0 0 0', lineHeight: 1.35 }}>
                        <strong>Work Performed:</strong> {inc.workerNotes || 'Repairs completed to municipal specification.'}
                      </p>
                    </div>
                  </div>

                  {/* Below Details: Worker name, description, date, location (Section 6) */}
                  <div style={{ background: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--slate-500)', display: 'block' }}>Field Worker Assigned:</span>
                      <strong style={{ color: 'var(--slate-900)' }}>
                        {inc.assignedWorker?.name || 'Rapid Response Squad A'} ({inc.assignedWorker?.team || 'Civil Squad'})
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--slate-500)', display: 'block' }}>Materials Logged:</span>
                      <span style={{ color: 'var(--slate-800)' }}>
                        {inc.materialsLogged || 'Standard bituminous compaction / LED fixtures'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--slate-500)', display: 'block' }}>Completion Location:</span>
                      <span style={{ color: 'var(--slate-800)' }}>
                        {inc.location.address} (GPS Verified)
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--slate-500)', display: 'block' }}>Original Location:</span>
                      <span style={{ color: 'var(--slate-800)' }}>
                        {inc.location.ward} • {inc.location.landmark}
                      </span>
                    </div>
                  </div>

                  {/* Three Actions: Approve Completed Work, Reject Completion Evidence, Request Rework (Section 6) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleVerifyCompletedWorkAction(inc.id, 'reject')}
                      className="btn btn-secondary text-danger"
                      style={{ fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      <XCircle size={14} />
                      <span>Reject Completion Evidence</span>
                    </button>

                    <button
                      onClick={() => handleVerifyCompletedWorkAction(inc.id, 'request_rework')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d97706', borderColor: '#fcd34d' }}
                    >
                      <RotateCcw size={14} />
                      <span>Request Rework</span>
                    </button>

                    <button
                      onClick={() => handleVerifyCompletedWorkAction(inc.id, 'approve')}
                      className="btn btn-primary"
                      style={{ background: '#059669', borderColor: '#059669', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      <Check size={14} />
                      <span>Approve Completed Work (Publish to Public)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------
          SECTION 4: ASSIGNED WORKERS OVERVIEW (Section 4)
         --------------------------------------------------------- */}
      {sectionTab === 'assigned' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
              Authorized Municipal Field Workforce Directory
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', margin: '2px 0 0 0' }}>
              Field squads available for dispatch across municipal divisions and geographic wards.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {workers.map((w) => (
              <div
                key={w.id}
                style={{
                  background: 'var(--white)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--slate-200)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                      {w.name}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--civic-600)', fontWeight: 600 }}>
                      {w.role}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    Active & Available
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span>📞 <strong>Mobile:</strong> {w.phone}</span>
                  <span>🏢 <strong>Department:</strong> {w.department}</span>
                  <span>📍 <strong>Assigned Area:</strong> {w.team}</span>
                  <span>⚡ <strong>Equipment:</strong> {w.equipment.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          STANDARD COMPLAINT CARDS FOR OTHER SECTIONS
         --------------------------------------------------------- */}
      {sectionTab !== 'notifications' && sectionTab !== 'awaiting_verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-600)' }}>
              Showing {filteredIncidents.length} complaint records in{' '}
              <strong style={{ color: 'var(--slate-900)' }}>
                {sectionTab === 'new'
                  ? 'New Complaints (Under Review)'
                  : sectionTab === 'approved'
                  ? 'Approved Complaints (Ready for Assignment)'
                  : sectionTab === 'work_in_progress'
                  ? 'Work in Progress'
                  : sectionTab === 'pending'
                  ? 'Pending Work Countdown'
                  : sectionTab === 'resolved'
                  ? 'Resolved Complaints'
                  : 'Overview'}
              </strong>
            </span>
          </div>

          {filteredIncidents.length === 0 ? (
            <div style={{ background: 'var(--white)', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--slate-200)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--emerald-600)', margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                No Complaints In This Queue
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                All civic infrastructure tasks in this category have been processed or moved to another stage.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
              {filteredIncidents.map((inc) => {
                const countdown = getDeadlineCountdown(inc.deadline, inc.deadlineTimestamp);
                const isOverdue = countdown.isOverdue || inc.escalationState === 'OVERDUE';

                return (
                  <div
                    key={inc.id}
                    className="card"
                    style={{
                      border: isOverdue ? '2px solid #fecaca' : inc.status === 'WORK_COMPLETED' ? '2px solid #bbf7d0' : '1px solid var(--slate-200)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--slate-100)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          background: isOverdue ? '#fff5f5' : '#f8fafc'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.78rem', color: 'var(--civic-700)', background: 'var(--white)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--slate-200)' }}>
                              #{inc.id}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--slate-200)', color: 'var(--slate-800)' }}>
                              {inc.category}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '3px', display: 'block' }}>
                            Submitted {inc.createdAt}
                          </span>
                        </div>

                        {/* Priority Badge */}
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: inc.priorityLevel === 'CRITICAL' ? '#ef4444' : inc.priorityLevel === 'HIGH' ? '#f97316' : '#3b82f6',
                              color: '#ffffff'
                            }}
                          >
                            Score: {inc.priorityScore}
                          </span>
                        </div>
                      </div>

                      {/* Card Media & Details (Section 3) */}
                      <div style={{ padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                        <img
                          src={inc.evidence.beforePhotoUrl}
                          alt={inc.title}
                          style={{
                            width: '90px',
                            height: '90px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--slate-200)',
                            flexShrink: 0
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.35, margin: 0 }}>
                            {inc.title}
                          </h4>

                          <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {inc.description}
                          </p>

                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} style={{ color: 'var(--civic-600)', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {inc.location.address}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                            Ward: <strong>{inc.location.ward}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Status Strip */}
                      <div
                        style={{
                          margin: '0 1rem 0.85rem 1rem',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: isOverdue ? '#fef2f2' : 'var(--slate-50)',
                          border: isOverdue ? '1px solid #fecaca' : '1px solid var(--slate-200)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                              Status:
                            </span>
                            <span className={`badge badge-${inc.status.toLowerCase()}`}>
                              {inc.status.replace('_', ' ')}
                            </span>
                          </div>

                          {inc.deadline && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: countdown.badgeBg,
                                color: countdown.badgeColor,
                                border: `1px solid ${countdown.badgeColor}33`
                              }}
                            >
                              ⏳ {countdown.label}
                            </span>
                          )}
                        </div>

                        {inc.assignedWorker && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-700)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '4px' }}>
                            <span><strong>Worker:</strong> {inc.assignedWorker.name} ({inc.assignedWorker.team})</span>
                            <span><strong>Progress:</strong> {inc.progressPercent || 30}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions (Section 3 Officer Actions) */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderTop: '1px solid var(--slate-100)',
                        background: '#ffffff',
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedIncident(inc)}
                        style={{ fontSize: '0.72rem', fontWeight: 700 }}
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>

                      {/* NEW / UNDER REVIEW BUTTONS: Approve, Reject, Request Info */}
                      {(inc.status === 'SUBMITTED' || inc.status === 'UNDER_REVIEW' || inc.status === 'AI_CHECK') && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setRequestingInfoIncident(inc);
                              setMoreInfoText('');
                            }}
                            style={{ fontSize: '0.72rem', fontWeight: 700 }}
                            title="Request additional information from citizen"
                          >
                            <HelpCircle size={13} />
                            <span>Request Info</span>
                          </button>

                          <button
                            className="btn btn-secondary btn-sm text-danger"
                            onClick={() => {
                              setRejectingIncident(inc);
                              setRejectionReasonText('');
                            }}
                            style={{ fontSize: '0.72rem', fontWeight: 700 }}
                            title="Reject with mandatory reason"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApproveOnly(inc)}
                            style={{ fontSize: '0.72rem', fontWeight: 700, background: '#059669', borderColor: '#059669' }}
                            title="Approve complaint for execution"
                          >
                            <Check size={13} />
                            <span>Approve Complaint</span>
                          </button>
                        </>
                      )}

                      {/* APPROVED COMPLAINT ACTION: Assign Worker */}
                      {inc.status === 'APPROVED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenAssignModal(inc)}
                          style={{ fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          <HardHat size={13} />
                          <span>Assign Worker</span>
                        </button>
                      )}

                      {/* EXTEND DEADLINE BUTTON */}
                      {inc.deadline && inc.status !== 'RESOLVED' && inc.status !== 'REJECTED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setExtendingDeadlineIncident(inc);
                            setExtensionNewDeadline('');
                            setExtensionReasonText('');
                          }}
                          style={{ fontSize: '0.72rem', fontWeight: 700 }}
                          title="Statutory Deadline Extension"
                        >
                          <CalendarPlus size={13} />
                          <span>Extend Deadline</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL 1: ASSIGN WORKER WITH CONFIRMATION (Section 4)
         --------------------------------------------------------- */}
      {assigningIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <HardHat size={18} style={{ color: 'var(--civic-600)' }} />
                Assign Field Worker to #{assigningIncident.id}
              </h3>
              <button className="modal-close-btn" onClick={() => setAssigningIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.8rem' }}>
                  <strong>Complaint:</strong> {assigningIncident.title} ({assigningIncident.location.ward})
                </div>

                {/* Worker Selection */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Select Authorized Field Crew / Technician:
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.team} ({w.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline Days */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Target Completion Deadline (Days):
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          setDeadlineDays(days);
                          setCustomDeadlineDate('');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: deadlineDays === days && !customDeadlineDate ? '2px solid var(--civic-600)' : '1px solid var(--slate-300)',
                          background: deadlineDays === days && !customDeadlineDate ? 'var(--civic-50)' : 'var(--white)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: deadlineDays === days && !customDeadlineDate ? 'var(--civic-700)' : 'var(--slate-700)',
                          cursor: 'pointer'
                        }}
                      >
                        {days} Day{days > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Work Order Instructions & Materials:
                  </label>
                  <textarea
                    rows={2}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                  />
                </div>

                {/* MANDATORY CONFIRMATION CHECKBOX (Section 4) */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--slate-800)', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={assignmentConfirmed}
                      onChange={(e) => setAssignmentConfirmed(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--civic-600)' }}
                      required
                    />
                    <span>
                      I officially confirm assigning this worker under municipal authority.
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssigningIncident(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!assignmentConfirmed}
                  className="btn btn-primary"
                  style={{ opacity: assignmentConfirmed ? 1 : 0.6, cursor: assignmentConfirmed ? 'pointer' : 'not-allowed' }}
                >
                  <Check size={14} />
                  <span>Assign Worker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL 2: REJECT COMPLAINT WITH MANDATORY REASON (Section 3)
         --------------------------------------------------------- */}
      {rejectingIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#dc2626' }}>
                <XCircle size={18} />
                Reject Complaint #{rejectingIncident.id}
              </h3>
              <button className="modal-close-btn" onClick={() => setRejectingIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.78rem', color: '#991b1b' }}>
                  Please state the legal or physical ground for rejection. This reason will be published directly to the citizen reporter.
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Mandatory Official Rejection Reason:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    placeholder="e.g. Duplicate of active ticket #CC-1042, or private property outside municipal jurisdiction."
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingIncident(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={!rejectionReasonText.trim()} className="btn btn-danger">
                  <XCircle size={14} />
                  <span>Confirm Official Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL 3: REQUEST MORE INFORMATION (Section 3)
         --------------------------------------------------------- */}
      {requestingInfoIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <HelpCircle size={18} style={{ color: 'var(--civic-600)' }} />
                Request Information on #{requestingInfoIncident.id}
              </h3>
              <button className="modal-close-btn" onClick={() => setRequestingInfoIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmMoreInfo}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Clarification Questions for Citizen:
                  </label>
                  <textarea
                    rows={3}
                    value={moreInfoText}
                    onChange={(e) => setMoreInfoText(e.target.value)}
                    placeholder="e.g. Please clarify exact pole number or landmark opposite the leaking pipe."
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRequestingInfoIncident(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={!moreInfoText.trim()} className="btn btn-primary">
                  <Send size={14} />
                  <span>Send Request to Citizen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL 4: EXTEND STATUTORY DEADLINE
         --------------------------------------------------------- */}
      {extendingDeadlineIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <CalendarPlus size={18} style={{ color: 'var(--civic-600)' }} />
                Extend Deadline: #{extendingDeadlineIncident.id}
              </h3>
              <button className="modal-close-btn" onClick={() => setExtendingDeadlineIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDeadlineExtension}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.78rem' }}>
                  Current Deadline: <strong>{extendingDeadlineIncident.deadline}</strong>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    New Revised Deadline Date:
                  </label>
                  <input
                    type="date"
                    value={extensionNewDeadline}
                    onChange={(e) => setExtensionNewDeadline(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Statutory Reason for Extension:
                  </label>
                  <textarea
                    rows={2}
                    value={extensionReasonText}
                    onChange={(e) => setExtensionReasonText(e.target.value)}
                    placeholder="e.g. Inclement weather delayed hot bitumen compaction; heavy rain forecasted."
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setExtendingDeadlineIncident(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={!extensionNewDeadline || !extensionReasonText.trim()} className="btn btn-primary">
                  <Check size={14} />
                  <span>Extend Deadline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL 5: CHANGE PASSWORD FOR YASH KUMAR (Section 1)
         --------------------------------------------------------- */}
      {isChangePasswordOpen && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <KeyRound size={18} style={{ color: 'var(--civic-600)' }} />
                Update Officer Password
              </h3>
              <button className="modal-close-btn" onClick={() => setIsChangePasswordOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                {passwordChangeStatus && (
                  <div
                    style={{
                      background: passwordChangeStatus.success ? '#f0fdf4' : '#fef2f2',
                      border: passwordChangeStatus.success ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      color: passwordChangeStatus.success ? '#166534' : '#991b1b'
                    }}
                  >
                    {passwordChangeStatus.message}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsChangePasswordOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={14} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for pending tasks
function inProgressComplaintsApproaching(incidents: CivicIncident[]) {
  return incidents.filter(
    (i) => i.status === 'ASSIGNED' || i.status === 'WORK_STARTED' || i.status === 'IN_PROGRESS' || i.status === 'APPROVED'
  );
}
