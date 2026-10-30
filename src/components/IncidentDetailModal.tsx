import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { CivicIncident, PriorityLevel } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { PriorityScoreExplainer } from './PriorityScoreExplainer';
import { DuplicateClusterVisualizer } from './DuplicateClusterVisualizer';
import { getDeadlineCountdown, parseDeadline } from '../utils/deadlines';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Building2,
  FileText,
  Layers,
  ArrowRight,
  Phone,
  Check,
  Camera,
  Upload,
  Star,
  XCircle,
  HelpCircle,
  Wrench,
  AlertCircle
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: CivicIncident | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose
}) => {
  const {
    currentRole,
    votePublicValidation,
    approveIncident,
    startWork,
    submitRepairProof,
    verifyCompletedWork,
    citizenConfirmResolution,
    citizenDisputeResolution,
    reopenIncident,
    workers,
    authenticatedOfficer,
    authenticatedWorker,
    playSound
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'overview' | 'worker_resolution' | 'priority' | 'clustering' | 'audit'>('overview');

  // Worker In-Complaint Completion State (Section 8)
  const [workerAfterPhoto, setWorkerAfterPhoto] = useState<string>(
    incident?.evidence.afterPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  );
  const [workerRepairNotes, setWorkerRepairNotes] = useState<string>('Repairs completed to municipal specification.');
  const [workerMaterials, setWorkerMaterials] = useState<string>('Standard repair squad equipment & materials logged.');
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);

  // Citizen Feedback State
  const [citizenRating, setCitizenRating] = useState<number>(5);
  const [citizenComment, setCitizenComment] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [showDisputeDialog, setShowDisputeDialog] = useState<boolean>(false);

  if (!incident) return null;

  // 9-Stage Recommended Statutory Lifecycle (Section 7)
  const timelineStages = [
    { key: 'SUBMITTED', label: '1. Submitted' },
    { key: 'UNDER_REVIEW', label: '2. Under Review' },
    { key: 'APPROVED', label: '3. Approved' },
    { key: 'ASSIGNED', label: '4. Assigned' },
    { key: 'WORK_STARTED', label: '5. Work Started' },
    { key: 'WORK_COMPLETED', label: '6. Work Completed' },
    { key: 'OFFICER_VERIFICATION', label: '7. Officer Verification' },
    { key: 'AWAITING_CITIZEN_FEEDBACK', label: '8. Citizen Feedback' },
    { key: 'RESOLVED', label: '9. Resolved' }
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'UNDER_REVIEW':
      case 'AI_CHECK': return 1;
      case 'APPROVED':
      case 'VERIFIED':
      case 'PUBLIC': return 2;
      case 'ASSIGNED':
      case 'ACKNOWLEDGED': return 3;
      case 'WORK_STARTED':
      case 'IN_PROGRESS': return 4;
      case 'WORK_COMPLETED': return 5;
      case 'OFFICER_VERIFICATION': return 6;
      case 'AWAITING_CITIZEN_FEEDBACK':
      case 'PUBLIC_VERIFY': return 7;
      case 'RESOLVED': return 8;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(incident.status);
  const countdown = getDeadlineCountdown(incident.deadline, incident.deadlineTimestamp);

  const handleSubmitWorkerCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProof(true);
    submitRepairProof(incident.id, workerAfterPhoto, workerRepairNotes, workerMaterials);
    setIsSubmittingProof(false);
  };

  const handleCitizenConfirm = () => {
    citizenConfirmResolution(incident.id, true, citizenRating, citizenComment || 'Work verified and satisfied with ground resolution.');
  };

  const handleCitizenDispute = () => {
    if (!disputeReason.trim()) return;
    citizenDisputeResolution(incident.id, disputeReason.trim());
    setShowDisputeDialog(false);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 3200 }}>
      <div className="modal-container" style={{ maxWidth: '860px', maxHeight: '92vh', borderRadius: 'var(--radius-xl)' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--civic-700)', background: 'var(--civic-50)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--civic-100)', fontFamily: 'var(--font-mono)' }}>
                #{incident.id}
              </span>
              <span className={`badge badge-${incident.status.toLowerCase()}`}>
                {incident.status.replace('_', ' ')}
              </span>
              {incident.escalationState !== 'NONE' && (
                <span className="badge badge-overdue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={11} /> {incident.escalationState}
                </span>
              )}
            </div>
            <h3 className="modal-title">{incident.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 9-Stage Interactive Lifecycle Stepper (Section 7) */}
        <div
          style={{
            background: 'var(--slate-50)',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--slate-200)',
            overflowX: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', minWidth: '650px', justifyContent: 'space-between' }}>
            {timelineStages.map((stg, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div key={stg.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: isCurrent ? 'var(--civic-600)' : isPast ? '#059669' : 'var(--slate-300)',
                        color: 'var(--white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        boxShadow: isCurrent ? '0 0 0 3px rgba(37, 99, 235, 0.25)' : 'none'
                      }}
                    >
                      {isPast ? <Check size={12} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? 'var(--civic-700)' : isPast ? 'var(--slate-700)' : 'var(--slate-400)',
                        textAlign: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {stg.label.replace(/^\d+\.\s*/, '')}
                    </span>
                  </div>
                  {idx < timelineStages.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        background: isPast ? '#059669' : 'var(--slate-200)',
                        margin: '0 4px',
                        marginBottom: '14px'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--slate-200)', background: 'var(--white)', padding: '0 1rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: activeTab === 'overview' ? 'var(--civic-600)' : 'var(--slate-600)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--civic-600)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Overview & Location
          </button>

          <button
            onClick={() => setActiveTab('worker_resolution')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: activeTab === 'worker_resolution' ? 'var(--civic-600)' : 'var(--slate-600)',
              borderBottom: activeTab === 'worker_resolution' ? '2px solid var(--civic-600)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <HardHat size={14} />
            <span>Worker Resolution & Proof</span>
          </button>

          <button
            onClick={() => setActiveTab('priority')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: activeTab === 'priority' ? 'var(--civic-600)' : 'var(--slate-600)',
              borderBottom: activeTab === 'priority' ? '2px solid var(--civic-600)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Explainable Priority (Score: {incident.priorityScore})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: activeTab === 'audit' ? 'var(--civic-600)' : 'var(--slate-600)',
              borderBottom: activeTab === 'audit' ? '2px solid var(--civic-600)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Audit Trail ({incident.auditLogs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Media & Key Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Photo Viewer */}
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Citizen Uploaded Photo & Ground Evidence:
                  </span>
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
                    <img
                      src={incident.evidence.beforePhotoUrl}
                      alt={incident.title}
                      style={{ width: '100%', height: '230px', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'var(--white)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem'
                      }}
                    >
                      📸 Geotagged • {incident.evidence.photoTimestamp}
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                      Problem Description:
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--slate-800)', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                      {incident.description}
                    </p>
                  </div>

                  <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                      <MapPin size={13} style={{ color: 'var(--civic-600)' }} />
                      <span>Detected Location & Ward:</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)', margin: '3px 0 0 0' }}>
                      {incident.location.address}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                      Ward: <strong>{incident.location.ward}</strong> | Coordinates: {incident.location.lat.toFixed(5)}° N, {incident.location.lng.toFixed(5)}° E
                    </span>
                  </div>

                  <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                        Assigned Department:
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--civic-700)' }}>
                        {incident.department}
                      </span>
                    </div>

                    {incident.deadline && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--slate-200)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                          Target Deadline:
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: countdown.badgeColor }}>
                          {incident.deadline} ({countdown.label})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CITIZEN VERIFICATION & DISPUTE SECTION (Section 2.A) */}
              {(incident.status === 'WORK_COMPLETED' || incident.status === 'AWAITING_CITIZEN_FEEDBACK' || incident.status === 'RESOLVED') && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                    border: '1px solid #bbf7d0',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={18} style={{ color: '#059669' }} />
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                          Citizen Verification & Ground Review
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '3px 0 0 0' }}>
                        Inspect the field worker's completion evidence to confirm whether the problem has been satisfactorily solved on the ground.
                      </p>
                    </div>

                    {incident.citizenFeedback && (
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        Citizen Rating: {incident.citizenFeedback.rating}/5 ★
                      </span>
                    )}
                  </div>

                  {incident.status === 'AWAITING_CITIZEN_FEEDBACK' && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleCitizenConfirm}
                        className="btn btn-primary"
                        style={{ background: '#059669', borderColor: '#059669', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        <Check size={14} /> Confirm Problem is Solved (5★)
                      </button>

                      <button
                        onClick={() => setShowDisputeDialog(true)}
                        className="btn btn-secondary text-danger"
                        style={{ fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        <RotateCcw size={14} /> Dispute / Reopen Complaint
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FIELD WORKER RESOLUTION & COMPLETION PROOF (Section 8 Dedicated Section) */}
          {activeTab === 'worker_resolution' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardHat size={20} style={{ color: '#d97706' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                      Dedicated Field Worker Work Section
                    </h4>
                  </div>
                  <span className={`badge badge-${incident.status.toLowerCase()}`}>
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', margin: 0 }}>
                  Upload before-and-after photos, describe repairs performed, log materials used, and submit for officer quality verification.
                </p>
              </div>

              {/* Before & After Photo Comparison */}
              {incident.evidence.afterPhotoUrl ? (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '6px' }}>
                    Interactive Before & After Photo Comparison:
                  </span>
                  <BeforeAfterSlider
                    beforeUrl={incident.evidence.beforePhotoUrl}
                    afterUrl={incident.evidence.afterPhotoUrl}
                    address={incident.location.address}
                  />
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.75rem' }}>
                    <div><strong>Worker Repair Notes:</strong> {incident.workerNotes || 'Repairs performed as per municipal SOP.'}</div>
                    <div style={{ marginTop: '3px' }}><strong>Materials Logged:</strong> {incident.materialsLogged || 'Standard materials deployed.'}</div>
                  </div>
                </div>
              ) : (
                /* Worker Upload Form (Section 8) */
                <form onSubmit={handleSubmitWorkerCompletion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                      Completion Photo Proof (URL or Camera Capture):
                    </label>
                    <input
                      type="text"
                      required
                      value={workerAfterPhoto}
                      onChange={(e) => setWorkerAfterPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setWorkerAfterPhoto('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Use Pothole Repair Sample
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkerAfterPhoto('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Use Sanitation Sample
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                      Short Description of Repair / Work Performed:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={workerRepairNotes}
                      onChange={(e) => setWorkerRepairNotes(e.target.value)}
                      placeholder="e.g. Cleared clogged storm drain, reinstalled heavy-duty cast iron grate."
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                      Materials & Heavy Equipment Logged:
                    </label>
                    <input
                      type="text"
                      value={workerMaterials}
                      onChange={(e) => setWorkerMaterials(e.target.value)}
                      placeholder="e.g. 50kg Bitumen mix, Vibratory compactor, 2 safety cones"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingProof}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem', fontWeight: 700, background: '#059669', borderColor: '#059669' }}
                  >
                    <Upload size={15} />
                    <span>{isSubmittingProof ? 'Uploading...' : 'Submit Completed Work to Officer for Verification'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: EXPLAINABLE PRIORITY SCORE */}
          {activeTab === 'priority' && (
            <div>
              <PriorityScoreExplainer
                incident={incident}
              />
            </div>
          )}

          {/* TAB 4: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Permanent Cryptographic Audit Ledger ({incident.auditLogs.length} events):
              </span>

              {incident.auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    background: 'var(--slate-50)',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ color: 'var(--slate-900)' }}>{log.action}</strong>
                    <span style={{ color: 'var(--slate-400)', fontSize: '0.7rem' }}>{log.timestamp}</span>
                  </div>
                  <p style={{ color: 'var(--slate-600)', margin: '2px 0 4px 0' }}>{log.details}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--civic-700)', fontWeight: 600 }}>
                    Actor: {log.actor} ({log.role})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          {/* Role specific quick buttons */}
          {currentRole === 'worker' && incident.status === 'ASSIGNED' && (
            <button
              className="btn btn-primary"
              onClick={() => startWork(incident.id)}
              style={{ fontWeight: 700 }}
            >
              <HardHat size={14} /> Start Work On-Site
            </button>
          )}

          {currentRole === 'officer' && incident.status === 'WORK_COMPLETED' && (
            <button
              className="btn btn-primary"
              onClick={() => verifyCompletedWork(incident.id, true, 'Officer inspection validated quality.')}
              style={{ fontWeight: 700, background: '#059669', borderColor: '#059669' }}
            >
              <ShieldCheck size={14} /> Approve Work & Request Citizen Verification
            </button>
          )}
        </div>

        {/* CITIZEN DISPUTE MODAL */}
        {showDisputeDialog && (
          <div className="modal-backdrop" style={{ zIndex: 3600 }}>
            <div className="modal-container" style={{ maxWidth: '460px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={18} style={{ color: '#dc2626' }} />
                  <h3 className="card-title" style={{ color: '#b91c1c' }}>Dispute Resolution & Reopen</h3>
                </div>
                <button className="modal-close-btn" onClick={() => setShowDisputeDialog(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: 0 }}>
                  Please state why the completion photo does not match the actual situation on the ground. The ticket will be reopened for emergency reinspection.
                </p>

                <textarea
                  rows={3}
                  required
                  placeholder="e.g. The pothole was only filled with loose sand and has washed away; traffic hazard persists."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDisputeDialog(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCitizenDispute}
                    className="btn btn-primary"
                    style={{ background: '#dc2626', borderColor: '#dc2626' }}
                  >
                    Confirm Dispute & Reopen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
