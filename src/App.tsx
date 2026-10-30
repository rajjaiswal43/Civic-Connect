import React from 'react';
import { useCivic } from './context/CivicContext';
import { Navbar } from './components/Navbar';
import { CitizenHome } from './components/CitizenHome';
import { OfficerDashboard } from './components/OfficerDashboard';
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

  const renderActiveView = () => {
    switch (activeTab) {
      case 'citizen':
        return <CitizenHome />;
      case 'officer':
        return <OfficerDashboard />;
      case 'worker':
        return <FieldWorkerApp />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'audit':
        return <AuditLogView />;
      default:
        return <CitizenHome />;
    }
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
