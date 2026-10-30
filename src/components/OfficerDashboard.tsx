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
  Award
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const {
    incidents,
    hotspots,
    selectedIncident,
    setSelectedIncident,
    approveIncident,
    rejectIncident,
    requestMoreInfo,
    extendDeadline,
    verifyCompletedWork,
    workers,
    officerProfile,
    authenticatedOfficer,
    setIsOfficerProfileModalOpen,
    setIsOfficerAuthModalOpen,
    notifications
  } = useCivic();

  // Active Section Tab (Section 5)
  // 'overview' | 'new' | 'active' | 'pending' | 'overdue' | 'completed' | 'notifications'
  const [sectionTab, setSectionTab] = useState<'overview' | 'new' | 'active' | 'pending' | 'overdue' | 'completed' | 'notifications'>('overview');

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

  // Form Inputs for Modals
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || 'w-1');
  const [deadlineDays, setDeadlineDays] = useState<number>(3);
  const [customDeadlineDate, setCustomDeadlineDate] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('Rapid response squad dispatched with standard equipment.');
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [moreInfoText, setMoreInfoText] = useState<string>('');
  const [extensionNewDeadline, setExtensionNewDeadline] = useState<string>('');
  const [extensionReasonText, setExtensionReasonText] = useState<string>('');

  // Officer Jurisdiction & Dept info
  const activeOfficer = authenticatedOfficer || {
    name: officerProfile.name,
    badgeNumber: officerProfile.badge_number,
    department: officerProfile.department,
    designation: officerProfile.designation,
    jurisdiction: officerProfile.zone
  };

  // KPI Calculations
  const newComplaints = incidents.filter(
    (i) => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW' || i.status === 'AI_CHECK'
  );
  const approvedComplaints = incidents.filter(
    (i) => i.status === 'APPROVED' || i.status === 'VERIFIED' || i.status === 'PUBLIC'
  );
  const inProgressComplaints = incidents.filter(
    (i) => i.status === 'WORK_STARTED' || i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED'
  );
  const awaitingVerificationComplaints = incidents.filter(
    (i) => i.status === 'WORK_COMPLETED'
  );
  const completedComplaints = incidents.filter(
    (i) => i.status === 'AWAITING_CITIZEN_FEEDBACK' || i.status === 'RESOLVED' || i.status === 'PUBLIC_VERIFY'
  );
  const overdueComplaints = incidents.filter((i) => {
    if (i.status === 'RESOLVED' || i.status === 'REJECTED') return false;
    const cd = getDeadlineCountdown(i.deadline, i.deadlineTimestamp);
    return cd.isOverdue || i.escalationState === 'OVERDUE';
  });

  // Filtered List
  const filteredIncidents = incidents.filter((inc) => {
    // Jurisdiction Filter
    if (filterMyJurisdictionOnly && activeOfficer.jurisdiction) {
      const matchWard = activeOfficer.jurisdiction.toLowerCase().includes(inc.location.ward.toLowerCase());
      const matchDept = activeOfficer.department ? inc.department.toLowerCase().includes(activeOfficer.department.toLowerCase().split(' ')[0]) : true;
      if (!matchWard && !matchDept) return false;
    }

    // Section Filter
    if (sectionTab === 'new') {
      if (inc.status !== 'SUBMITTED' && inc.status !== 'UNDER_REVIEW' && inc.status !== 'AI_CHECK') return false;
    } else if (sectionTab === 'active') {
      if (inc.status !== 'APPROVED' && inc.status !== 'ASSIGNED' && inc.status !== 'WORK_STARTED' && inc.status !== 'IN_PROGRESS') return false;
    } else if (sectionTab === 'pending') {
      // Pending work approaching deadline
      if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return false;
      if (inc.status !== 'ASSIGNED' && inc.status !== 'WORK_STARTED' && inc.status !== 'IN_PROGRESS' && inc.status !== 'APPROVED') return false;
    } else if (sectionTab === 'overdue') {
      if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return false;
      const cd = getDeadlineCountdown(inc.deadline, inc.deadlineTimestamp);
      if (!cd.isOverdue && inc.escalationState !== 'OVERDUE') return false;
    } else if (sectionTab === 'completed') {
      if (inc.status !== 'WORK_COMPLETED' && inc.status !== 'AWAITING_CITIZEN_FEEDBACK' && inc.status !== 'RESOLVED' && inc.status !== 'PUBLIC_VERIFY') return false;
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

  const handleOpenAssignModal = (inc: CivicIncident) => {
    setAssigningIncident(inc);
    setSelectedWorkerId(workers[0]?.id || 'w-1');
    setDeadlineDays(3);
    setAssignmentNotes('Standard rapid response dispatch squad.');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningIncident) return;

    approveIncident(
      assigningIncident.id,
      selectedWorkerId,
      deadlineDays,
      customDeadlineDate || undefined,
      assignmentNotes
    );
    setAssigningIncident(null);
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingIncident || !rejectionReasonText.trim()) return;

    rejectIncident(rejectingIncident.id, rejectionReasonText.trim());
    setRejectingIncident(null);
    setRejectionReasonText('');
  };

  const handleConfirmMoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingInfoIncident || !moreInfoText.trim()) return;

    requestMoreInfo(requestingInfoIncident.id, moreInfoText.trim());
    setRequestingInfoIncident(null);
    setMoreInfoText('');
  };

  const handleConfirmDeadlineExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingDeadlineIncident || !extensionNewDeadline.trim() || !extensionReasonText.trim()) return;

    extendDeadline(extendingDeadlineIncident.id, extensionNewDeadline.trim(), extensionReasonText.trim());
    setExtendingDeadlineIncident(null);
    setExtensionNewDeadline('');
    setExtensionReasonText('');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* MUNICIPAL AUTHORITY HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'var(--civic-50)', color: 'var(--civic-700)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
              Municipal Corporation • Zonal Command
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Zone 1 Public Works & Urban Infrastructure Division
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px', letterSpacing: '-0.02em' }}>
            Officer Command & Dispatch Portal
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsOfficerProfileModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <ShieldCheck size={15} style={{ color: 'var(--civic-600)' }} />
            <span>Official Identity Card</span>
          </button>
        </div>
      </div>

      {/* OFFICER CREDENTIALS BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091e3a, #132f57, #1e3a8a)',
          color: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24, #d97706)',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
              flexShrink: 0
            }}
          >
            {activeOfficer.name.split(' ').map((n) => n[0]).filter(Boolean).slice(-2).join('')}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--white)', margin: 0 }}>
                {activeOfficer.name}
              </h3>
              <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Badge: {activeOfficer.badgeNumber}
              </span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Authorized Municipal Signatory
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px', fontWeight: 600 }}>
              {activeOfficer.designation} • {activeOfficer.department}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '4px', fontSize: '0.72rem', color: '#94a3b8', flexWrap: 'wrap' }}>
              <span>📍 <strong>Jurisdiction:</strong> {activeOfficer.jurisdiction}</span>
              <span>⚡ <strong>Statutory Authority:</strong> UP Municipal Corp. Act §112</span>
            </div>
          </div>
        </div>

        {/* Filter to My Jurisdiction Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: filterMyJurisdictionOnly ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: 'var(--white)'
          }}
        >
          <input
            type="checkbox"
            checked={filterMyJurisdictionOnly}
            onChange={(e) => setFilterMyJurisdictionOnly(e.target.checked)}
          />
          <span>Filter to My Department & Ward</span>
        </label>
      </div>

      {/* DASHBOARD SECTIONS NAVIGATION BAR (Section 5) */}
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
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
        >
          <TrendingUp size={15} />
          <span>Overview ({incidents.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'new' ? 'active' : ''}`}
          onClick={() => setSectionTab('new')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
        >
          <AlertCircle size={15} />
          <span>New Complaints ({newComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'active' ? 'active' : ''}`}
          onClick={() => setSectionTab('active')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
        >
          <HardHat size={15} />
          <span>Active Work ({inProgressComplaints.length + approvedComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'pending' ? 'active' : ''}`}
          onClick={() => setSectionTab('pending')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)', color: sectionTab === 'pending' ? 'var(--white)' : '#d97706' }}
        >
          <Clock size={15} />
          <span>Pending Work Countdown ({inProgressComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setSectionTab('overdue')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)', color: sectionTab === 'overdue' ? 'var(--white)' : '#dc2626' }}
        >
          <AlertTriangle size={15} />
          <span>Overdue Work ({overdueComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'completed' ? 'active' : ''}`}
          onClick={() => setSectionTab('completed')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
        >
          <CheckCircle2 size={15} />
          <span>Completed & Verified ({completedComplaints.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${sectionTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setSectionTab('notifications')}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
        >
          <Bell size={15} />
          <span>Notifications ({notifications.filter((n) => n.unread).length})</span>
        </button>
      </div>

      {/* SECTION 1: OVERVIEW METRIC CARDS (Section 5 Overview) */}
      {sectionTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Total Received
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
                {incidents.length + 120}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)' }}>All logged complaints</span>
            </div>

            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--amber-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber-700)', textTransform: 'uppercase' }}>
                New Review Needed
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                {newComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#b45309' }}>Awaiting Officer Approval</span>
            </div>

            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--civic-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--civic-700)', textTransform: 'uppercase' }}>
                Approved / Assigned
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--civic-600)', marginTop: '2px' }}>
                {approvedComplaints.length + inProgressComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>Work orders active</span>
            </div>

            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #bfdbfe', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                Work in Progress
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                {inProgressComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#1d4ed8' }}>Field squads on-site</span>
            </div>

            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fed7aa', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                Awaiting Verification
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                {awaitingVerificationComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#c2410c' }}>Completion photos ready</span>
            </div>

            <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--emerald-200)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--emerald-700)', textTransform: 'uppercase' }}>
                Completed & Verified
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                {completedComplaints.length + 65}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#059669' }}>Citizen audit confirmed</span>
            </div>

            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
                Overdue Tasks
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                {overdueComplaints.length}
              </p>
              <span style={{ fontSize: '0.68rem', color: '#b91c1c' }}>Past target deadline</span>
            </div>
          </div>

          {/* GIS OPERATIONS MAP */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Building2 size={18} style={{ color: 'var(--civic-600)' }} />
                  Municipal GIS Operations & Hotspot Map
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Interactive spatial geofences, ward boundaries & recurring defect clusters
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

      {/* SEARCH, FILTER & SORT TOOLBAR */}
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
        </div>
      </div>

      {/* SECTION CONTENT: LIST OF COMPLAINTS */}
      {sectionTab === 'notifications' ? (
        /* NOTIFICATIONS SECTION */
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bell size={18} style={{ color: 'var(--civic-600)' }} />
              Official Operational Notifications & Citizen Updates
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            {notifications.map((n) => (
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
            ))}
          </div>
        </div>
      ) : (
        /* COMPLAINTS CARDS GRID */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-600)' }}>
              Showing {filteredIncidents.length} complaints in{' '}
              <strong style={{ color: 'var(--slate-900)' }}>
                {sectionTab === 'new' ? 'New Complaints' : sectionTab === 'active' ? 'Active Work' : sectionTab === 'pending' ? 'Pending Work (Countdown)' : sectionTab === 'overdue' ? 'Overdue Work' : sectionTab === 'completed' ? 'Completed Work' : 'All Queues'}
              </strong>
            </span>
          </div>

          {filteredIncidents.length === 0 ? (
            <div style={{ background: 'var(--white)', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--slate-200)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--emerald-600)', margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                No complaints in this queue
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                All civic infrastructure tasks in this category have been processed or moved to the next lifecycle stage.
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
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
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

                      {/* Card Media & Description */}
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
                        </div>
                      </div>

                      {/* Status & Deadline Strip (Section 6 Countdown Card) */}
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

                          {/* Dynamic Countdown Display */}
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

                        {/* Assigned Worker Info */}
                        {inc.assignedWorker && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-700)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '4px' }}>
                            <span><strong>Worker:</strong> {inc.assignedWorker.name} ({inc.assignedWorker.team})</span>
                            <span><strong>Progress:</strong> {inc.progressPercent || 30}%</span>
                          </div>
                        )}

                        {inc.deadline && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                            <strong>Deadline:</strong> {inc.deadline}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action Buttons (Section 2.B Officer Capabilities) */}
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

                      {/* NEW / UNAPPROVED COMPLAINT ACTIONS */}
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
                            title="Reject invalid or duplicate report with reason"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenAssignModal(inc)}
                            style={{ fontSize: '0.72rem', fontWeight: 700 }}
                          >
                            <Check size={13} />
                            <span>Approve & Assign</span>
                          </button>
                        </>
                      )}

                      {/* ACTIVE / ASSIGNED ACTIONS */}
                      {(inc.status === 'APPROVED' || inc.status === 'ASSIGNED' || inc.status === 'WORK_STARTED' || inc.status === 'IN_PROGRESS') && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setExtendingDeadlineIncident(inc);
                              setExtensionNewDeadline('');
                              setExtensionReasonText('');
                            }}
                            style={{ fontSize: '0.72rem', fontWeight: 700 }}
                            title="Extend statutory completion deadline with recorded reason"
                          >
                            <CalendarPlus size={13} />
                            <span>Extend Deadline</span>
                          </button>
                        </>
                      )}

                      {/* WORK COMPLETED AWAITING OFFICER VERIFICATION */}
                      {inc.status === 'WORK_COMPLETED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedIncident(inc)}
                          style={{ fontSize: '0.72rem', fontWeight: 700, background: '#059669', borderColor: '#059669' }}
                        >
                          <ShieldCheck size={13} />
                          <span>Verify Completion Proof</span>
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

      {/* MODAL 1: APPROVE & ASSIGN WORKER */}
      {assigningIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--civic-600)' }} />
                <h3 className="card-title">Approve Complaint & Dispatch Field Worker</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setAssigningIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                  Complaint #{assigningIncident.id}: {assigningIncident.title}
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  Location: {assigningIncident.location.address}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Select Assigned Field Squad:
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.role} ({w.team}, {w.currentTasksCount} active tasks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Target Resolution Deadline:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[1, 3, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setDeadlineDays(days);
                        setCustomDeadlineDate('');
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: deadlineDays === days && !customDeadlineDate ? '2px solid var(--civic-600)' : '1px solid var(--slate-300)',
                        background: deadlineDays === days && !customDeadlineDate ? 'var(--civic-50)' : 'var(--white)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Or enter custom deadline (e.g. 10 Nov 2026, 06:00 PM)"
                  value={customDeadlineDate}
                  onChange={(e) => setCustomDeadlineDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Officer Work Notes & Ground Instructions:
                </label>
                <textarea
                  rows={2}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssigningIncident(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Approval & Dispatch Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT COMPLAINT */}
      {rejectingIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={18} style={{ color: '#dc2626' }} />
                <h3 className="card-title" style={{ color: '#b91c1c' }}>Reject Civic Complaint</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setRejectingIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: 0 }}>
                Please provide the official reason for rejecting #{rejectingIncident.id}. This justification will be logged in the permanent audit ledger and communicated to the citizen.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Official Ground Reason:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Defect is inside a private gated residential society; not within municipal roadway jurisdiction."
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingIncident(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                  Confirm Official Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST MORE INFO */}
      {requestingInfoIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} style={{ color: 'var(--civic-600)' }} />
                <h3 className="card-title">Request Additional Information</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setRequestingInfoIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmMoreInfo} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: 0 }}>
                Request additional photos or details from the citizen to assess complaint #{requestingInfoIncident.id}.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Information Requested from Citizen:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Please upload a wider-angle photo showing the nearby landmark or intersection pole number."
                  value={moreInfoText}
                  onChange={(e) => setMoreInfoText(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRequestingInfoIncident(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Information Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EXTEND DEADLINE (Section 6) */}
      {extendingDeadlineIncident && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarPlus size={18} style={{ color: '#d97706' }} />
                <h3 className="card-title">Extend Statutory Completion Deadline</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setExtendingDeadlineIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDeadlineExtension} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: 0 }}>
                In accordance with municipal service transparency guidelines, deadline extensions must record the official justification in the permanent complaint history.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Current Deadline:
                </label>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {extendingDeadlineIncident.deadline || 'None'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Revised Completion Deadline:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24 Aug 2026, 06:00 PM"
                  value={extensionNewDeadline}
                  onChange={(e) => setExtensionNewDeadline(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Administrative Justification / Reason:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Continuous heavy monsoon downpour prevented asphalt compaction; postponed for dry road surface."
                  value={extensionReasonText}
                  onChange={(e) => setExtensionReasonText(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setExtendingDeadlineIncident(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                  Record Extension in History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
