import React, { useState, useRef, useEffect } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ShieldAlert,
  User,
  Building2,
  HardHat,
  BarChart3,
  ShieldCheck,
  PlusCircle,
  Bell,
  MoreVertical,
  Terminal,
  Smartphone,
  Monitor,
  RotateCcw,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
    setSelectedIncident,
    incidents,
    officerProfile,
    authenticatedOfficer,
    setIsOfficerProfileModalOpen,
    setIsOfficerAuthModalOpen,
    setIsWorkerAuthModalOpen,
    authenticatedWorker,
    logoutOfficer,
    logoutWorker,
    setIsReportModalOpen,
    isBackendOnline,
    isMobileFrameActive,
    setIsMobileFrameActive,
    setIsApiExplorerOpen,
    resetToDefaultData
  } = useCivic();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'citizen') {
      setCurrentRole('citizen');
    } else if (tab === 'officer') {
      setCurrentRole('officer');
      // If not authenticated, prompt login
      if (!authenticatedOfficer) {
        setIsOfficerAuthModalOpen(true);
      }
    } else if (tab === 'worker') {
      setCurrentRole('worker');
      if (!authenticatedWorker) {
        setIsWorkerAuthModalOpen(true);
      }
    }
  };

  const handleNotificationClick = (incidentId: string, notifId: string) => {
    markNotificationRead(notifId);
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) {
      setSelectedIncident(inc);
    }
    setShowNotifMenu(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand & Municipal Authority Logo */}
        <div className="brand-section" onClick={() => handleNavClick('citizen')} style={{ cursor: 'pointer' }}>
          <div className="brand-emblem">
            <ShieldAlert size={20} />
          </div>
          <div className="brand-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>CIVIC CONNECT</h1>
              <span className="gnida-tag">MUNICIPAL PORTAL</span>
            </div>
            <p className="brand-tagline">Smart Civic Issue Reporting & Resolution Platform</p>
          </div>
        </div>

        {/* Primary Portal Navigation */}
        <nav className="nav-tabs-wrapper">
          <button
            className={`nav-tab-btn ${activeTab === 'citizen' ? 'active' : ''}`}
            onClick={() => handleNavClick('citizen')}
          >
            <User size={15} />
            <span>Citizen Portal</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'officer' ? 'active' : ''}`}
            onClick={() => handleNavClick('officer')}
          >
            <Building2 size={15} />
            <span>Officer Command</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'worker' ? 'active' : ''}`}
            onClick={() => handleNavClick('worker')}
          >
            <HardHat size={15} />
            <span>Field Workforce</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
          >
            <BarChart3 size={15} />
            <span>City Analytics</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => handleNavClick('audit')}
          >
            <ShieldCheck size={15} />
            <span>Audit Ledger</span>
          </button>
        </nav>

        {/* Right Action Hub */}
        <div className="nav-actions">
          {/* Primary Action Button: Report Issue */}
          <button
            className="report-cta-btn"
            onClick={() => setIsReportModalOpen(true)}
            title="Submit a new civic issue report with geotagged photo"
          >
            <PlusCircle size={15} />
            <span>+ Report Issue</span>
          </button>

          {/* Backend Connection Indicator */}
          <div
            className={`api-status-pill ${isBackendOnline ? 'online' : 'offline'}`}
            title={isBackendOnline ? 'FastAPI Backend running on :8000 (Live Connection)' : 'Operating in local offline state'}
          >
            <span className="status-dot" />
            <span>{isBackendOnline ? 'Live API' : 'Local'}</span>
          </div>

          {/* Officer Auth / Profile Pill */}
          {activeTab === 'officer' && (
            authenticatedOfficer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="officer-badge-btn"
                  onClick={() => setIsOfficerProfileModalOpen(true)}
                  title="View Official Government Credentials"
                >
                  <div className="officer-avatar-mini">
                    {authenticatedOfficer.name.split(' ').map((n) => n[0]).filter(Boolean).slice(-2).join('')}
                  </div>
                  <div className="officer-badge-info">
                    <span className="officer-badge-name">{authenticatedOfficer.name}</span>
                    <span className="officer-badge-id">{authenticatedOfficer.badgeNumber}</span>
                  </div>
                </button>
                <button
                  onClick={logoutOfficer}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#dc2626',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Sign Out of Officer Session"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsOfficerAuthModalOpen(true)}
                style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <LogIn size={14} />
                <span>Officer Login</span>
              </button>
            )
          )}

          {/* Field Worker Pill */}
          {activeTab === 'worker' && authenticatedWorker && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  background: 'var(--amber-50)',
                  border: '1px solid var(--amber-200)',
                  color: 'var(--amber-900)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <HardHat size={14} style={{ color: '#d97706' }} />
                <span>{authenticatedWorker.name} ({authenticatedWorker.team})</span>
              </div>
              <button
                onClick={logoutWorker}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
                title="Switch Field Crew"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}

          {/* Realtime Notifications Dropdown */}
          <div className="relative-container" ref={notifRef}>
            <button
              className="icon-action-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              title="Realtime Municipal Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            {showNotifMenu && (
              <div className="dropdown-panel notif-dropdown">
                <div className="dropdown-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                      Notifications ({unreadCount} new)
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Live Event Stream</span>
                  </div>
                </div>

                <div className="dropdown-body">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.unread ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n.incidentId, n.id)}
                    >
                      <div className="notif-item-header">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-time">{n.timestamp}</span>
                      </div>
                      <p className="notif-msg">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Platform Tools Dropdown */}
          <div className="relative-container" ref={toolsRef}>
            <button
              className={`icon-action-btn ${showToolsMenu ? 'active' : ''}`}
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              title="Platform Diagnostics & Architecture Inspector"
            >
              <MoreVertical size={17} />
            </button>

            {showToolsMenu && (
              <div className="dropdown-panel tools-dropdown">
                <div className="dropdown-header">
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--slate-500)' }}>
                    Platform Architecture Tools
                  </span>
                </div>

                <div className="tools-list">
                  {/* Backend API & DB Explorer */}
                  <button
                    className="tools-item"
                    onClick={() => {
                      setShowToolsMenu(false);
                      setIsApiExplorerOpen(true);
                    }}
                  >
                    <Terminal size={15} style={{ color: '#059669' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span className="tools-item-title">REST API & PostGIS Inspector</span>
                      <p className="tools-item-desc">Execute live FastAPI endpoints & inspect database schema</p>
                    </div>
                  </button>

                  {/* Mobile Frame Toggle */}
                  <button
                    className="tools-item"
                    onClick={() => {
                      setShowToolsMenu(false);
                      setIsMobileFrameActive(!isMobileFrameActive);
                    }}
                  >
                    {isMobileFrameActive ? <Monitor size={15} style={{ color: '#7c3aed' }} /> : <Smartphone size={15} style={{ color: '#7c3aed' }} />}
                    <div style={{ textAlign: 'left' }}>
                      <span className="tools-item-title">{isMobileFrameActive ? 'Switch to Full Desktop View' : 'Preview Smartphone Viewport'}</span>
                      <p className="tools-item-desc">Test mobile responsive citizen capture interface</p>
                    </div>
                  </button>

                  {/* Reset Dataset */}
                  <button
                    className="tools-item text-danger"
                    onClick={() => {
                      setShowToolsMenu(false);
                      resetToDefaultData();
                    }}
                  >
                    <RotateCcw size={15} />
                    <div style={{ textAlign: 'left' }}>
                      <span className="tools-item-title">Reset Demo Complaints</span>
                      <p className="tools-item-desc">Restores initial municipal complaints and test records</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
