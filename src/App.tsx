import React, { useState, useEffect } from 'react';
import { useCivic } from './context/CivicContext';
import { Navbar } from './components/Navbar';
import { CitizenHome } from './components/CitizenHome';
import { OfficerDashboard } from './components/OfficerDashboard';
import { OfficerLoginPage } from './components/OfficerLoginPage';
import { FieldWorkerApp } from './components/FieldWorkerApp';
import { ReportIssueModal } from './components/ReportIssueModal';
import { AIVerificationModal } from './components/AIVerificationModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuditLogView } from './components/AuditLogView';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { OfficerProfileModal } from './components/OfficerProfileModal';
import { OfficerAuthModal } from './components/OfficerAuthModal';
import { WorkerAuthModal } from './components/WorkerAuthModal';

export const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setCurrentRole,
    authenticatedOfficer,
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
    isMobileFrameActive
  } = useCivic();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  // Synchronize on browser history navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);

      if (path === '/officer/login' || path === '/officer/dashboard') {
        setActiveTab('officer');
        setCurrentRole('officer');
      } else if (path === '/worker') {
        setActiveTab('worker');
        setCurrentRole('worker');
      } else if (path === '/analytics') {
        setActiveTab('analytics');
      } else if (path === '/audit') {
        setActiveTab('audit');
      } else {
        setActiveTab('citizen');
        setCurrentRole('citizen');
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Initial sync on mount
    handlePopState();

    const params = new URLSearchParams(window.location.search);
    if (params.get('report') === 'true') {
      setIsReportModalOpen(true);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, setCurrentRole, setIsReportModalOpen]);

  // Handle route protection for /officer/dashboard
  useEffect(() => {
    if (currentPath === '/officer/dashboard' && !authenticatedOfficer) {
      window.history.replaceState({}, '', '/officer/login');
      setCurrentPath('/officer/login');
    }
  }, [currentPath, authenticatedOfficer]);

  const renderActiveView = () => {
    // 1. Dedicated Officer Login Route
    if (currentPath === '/officer/login') {
      return (
        <OfficerLoginPage
          onLoginSuccess={() => {
            window.history.pushState({}, '', '/officer/dashboard');
            setCurrentPath('/officer/dashboard');
            setActiveTab('officer');
            setCurrentRole('officer');
          }}
          onNavigateHome={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
            setActiveTab('citizen');
            setCurrentRole('citizen');
          }}
        />
      );
    }

    // 2. Dedicated Officer Dashboard Route
    if (currentPath === '/officer/dashboard') {
      if (!authenticatedOfficer) {
        return (
          <OfficerLoginPage
            onLoginSuccess={() => {
              window.history.pushState({}, '', '/officer/dashboard');
              setCurrentPath('/officer/dashboard');
              setActiveTab('officer');
              setCurrentRole('officer');
            }}
            onNavigateHome={() => {
              window.history.pushState({}, '', '/');
              setCurrentPath('/');
              setActiveTab('citizen');
              setCurrentRole('citizen');
            }}
          />
        );
      }
      return <OfficerDashboard />;
    }

    // 3. Dedicated Worker Route
    if (currentPath === '/worker' || activeTab === 'worker') {
      return <FieldWorkerApp />;
    }

    // 4. Analytics Route
    if (currentPath === '/analytics' || activeTab === 'analytics') {
      return <AnalyticsDashboard />;
    }

    // 5. Audit Ledger Route
    if (currentPath === '/audit' || activeTab === 'audit') {
      return <AuditLogView />;
    }

    // 6. Officer Tab Fallback (if activeTab is officer but URL is not updated yet)
    if (activeTab === 'officer') {
      if (!authenticatedOfficer) {
        return (
          <OfficerLoginPage
            onLoginSuccess={() => {
              window.history.pushState({}, '', '/officer/dashboard');
              setCurrentPath('/officer/dashboard');
              setActiveTab('officer');
              setCurrentRole('officer');
            }}
            onNavigateHome={() => {
              window.history.pushState({}, '', '/');
              setCurrentPath('/');
              setActiveTab('citizen');
              setCurrentRole('citizen');
            }}
          />
        );
      }
      return <OfficerDashboard />;
    }

    // Default: Citizen Home
    return <CitizenHome />;
  };

  return (
    <div className="app-container">
      {/* Enterprise Municipal Navbar */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="main-content">
        {isMobileFrameActive ? (
          <div className="mobile-frame-wrapper">
            <div className="mobile-notch">
              <div className="mobile-camera-dot"></div>
            </div>
            {renderActiveView()}
          </div>
        ) : (
          renderActiveView()
        )}
      </main>

      {/* Modals & Dialogs */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <AIVerificationModal
        isOpen={isAIVerifyModalOpen}
        onClose={() => setIsAIVerifyModalOpen(false)}
        incident={selectedIncident}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      <OfficerProfileModal
        isOpen={isOfficerProfileModalOpen}
        onClose={() => setIsOfficerProfileModalOpen(false)}
      />

      <OfficerAuthModal
        isOpen={isOfficerAuthModalOpen}
        onClose={() => setIsOfficerAuthModalOpen(false)}
      />

      <WorkerAuthModal
        isOpen={isWorkerAuthModalOpen}
        onClose={() => setIsWorkerAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
