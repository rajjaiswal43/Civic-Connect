import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { DeviceCameraCapture } from './DeviceCameraCapture';
import { CIVIC_PRESET_IMAGES } from '../data/seedData';
import { CivicIncident } from '../types';
import { getDeadlineCountdown } from '../utils/deadlines';
import {
  HardHat,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Camera,
  Upload,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Wifi,
  Radio,
  Pause,
  Play,
  HelpCircle,
  Wrench,
  Layers,
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';

export const FieldWorkerApp: React.FC = () => {
  const {
    incidents,
    setSelectedIncident,
    updateWorkerTaskStatus,
    startWork,
    submitRepairProof,
    authenticatedWorker,
    workers,
    setIsWorkerAuthModalOpen,
    logoutWorker,
    playSound
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'assigned' | 'in_progress' | 'completed'>('assigned');
  const [selectedTask, setSelectedTask] = useState<CivicIncident | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(CIVIC_PRESET_IMAGES.potholeAfter);
  const [repairNotes, setRepairNotes] = useState<string>(
    'Hot bituminous cold mix compaction completed. Surface leveled to grade and sealed with asphalt emulsion.'
  );
  const [materialsLogged, setMaterialsLogged] = useState<string>(
    '50kg Bitumen Cold Mix Type II, Bituminous Emulsion RS-1 (10L), Plate Compactor Unit 4'
  );
  const [isCapturingProof, setIsCapturingProof] = useState<boolean>(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);
  const [isOfflineSynced, setIsOfflineSynced] = useState<boolean>(true);

  // Active Worker Profile
  const currentWorker = authenticatedWorker || workers[0];

  // Worker's filtered tasks
  const assignedTasks = incidents.filter(
    (i) => i.status === 'ASSIGNED' || i.status === 'APPROVED'
  );
  const inProgressTasks = incidents.filter(
    (i) => i.status === 'WORK_STARTED' || i.status === 'IN_PROGRESS' || i.escalationState === 'REOPENED'
  );
  const completedTasks = incidents.filter(
    (i) => i.status === 'WORK_COMPLETED' || i.status === 'AWAITING_CITIZEN_FEEDBACK' || i.status === 'RESOLVED' || i.status === 'PUBLIC_VERIFY'
  );

  const handleStartTask = (taskId: string) => {
    startWork(taskId);
    setActiveTab('in_progress');
    playSound('success');
  };

  const handleOpenProofModal = (task: CivicIncident) => {
    setSelectedTask(task);
    if (task.category === 'Pothole') setAfterPhotoUrl(CIVIC_PRESET_IMAGES.potholeAfter);
    else if (task.category === 'Garbage') setAfterPhotoUrl(CIVIC_PRESET_IMAGES.garbageAfter);
    else if (task.category === 'Streetlight') setAfterPhotoUrl(CIVIC_PRESET_IMAGES.streetlightAfter);
    else setAfterPhotoUrl(CIVIC_PRESET_IMAGES.waterLeakAfter);
    setIsCapturingProof(true);
    playSound('click');
  };

  const handleSubmitProof = (taskId: string) => {
    setIsSubmittingProof(true);
    setTimeout(() => {
      submitRepairProof(taskId, afterPhotoUrl, repairNotes, materialsLogged);
      setIsSubmittingProof(false);
      setIsCapturingProof(false);
      setSelectedTask(null);
      setActiveTab('completed');
      playSound('success');
    }, 600);
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* WORKER PROFILE BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          color: 'var(--white)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}
          >
            {currentWorker.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--white)', margin: 0 }}>
                {currentWorker.name}
              </h2>
              <span style={{ fontSize: '0.68rem', background: '#3b82f6', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {currentWorker.role}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              {currentWorker.team} • {currentWorker.department}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsWorkerAuthModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Switch Squad
          </button>
        </div>
      </div>

      {/* TABS FOR ASSIGNED / IN PROGRESS / COMPLETED */}
      <div style={{ display: 'flex', background: 'var(--slate-200)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
        <button
          onClick={() => setActiveTab('assigned')}
          style={{
            flex: 1,
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: 'none',
            background: activeTab === 'assigned' ? 'var(--white)' : 'transparent',
            color: activeTab === 'assigned' ? 'var(--slate-900)' : 'var(--slate-600)',
            boxShadow: activeTab === 'assigned' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <span>Assigned Work Orders</span>
          <span style={{ background: 'var(--amber-100)', color: 'var(--amber-800)', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            {assignedTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          style={{
            flex: 1,
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: 'none',
            background: activeTab === 'in_progress' ? 'var(--white)' : 'transparent',
            color: activeTab === 'in_progress' ? 'var(--slate-900)' : 'var(--slate-600)',
            boxShadow: activeTab === 'in_progress' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <span>Work in Progress (On-Site)</span>
          <span style={{ background: 'var(--civic-100)', color: 'var(--civic-800)', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            {inProgressTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          style={{
            flex: 1,
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: 'none',
            background: activeTab === 'completed' ? 'var(--white)' : 'transparent',
            color: activeTab === 'completed' ? 'var(--slate-900)' : 'var(--slate-600)',
            boxShadow: activeTab === 'completed' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <span>Completion Proof Submitted</span>
          <span style={{ background: 'var(--emerald-100)', color: 'var(--emerald-800)', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* TASK LIST CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeTab === 'assigned' && (
          assignedTasks.length === 0 ? (
            <div style={{ background: 'var(--white)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
              <p style={{ color: 'var(--slate-500)', margin: 0 }}>No pending assignments currently in queue.</p>
            </div>
          ) : (
            assignedTasks.map((task) => {
              const countdown = getDeadlineCountdown(task.deadline, task.deadlineTimestamp);
              return (
                <div key={task.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--civic-700)', background: 'var(--civic-50)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      WORK ORDER #{task.id}
                    </span>
                    <span className={`badge priority-${task.priorityLevel.toLowerCase()}`}>
                      {task.priorityLevel} PRIORITY ({task.priorityScore}/100)
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '4px' }}>
                    {task.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                    <MapPin size={14} style={{ color: 'var(--civic-600)' }} />
                    <span>{task.location.address}</span>
                  </div>

                  {/* Target Deadline & Authoritative Countdown */}
                  <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.75rem' }}>
                    <span>Target Deadline: <strong>{task.deadline || '7 Nov 2026, 06:00 PM'}</strong></span>
                    <span style={{ color: countdown.badgeColor, fontWeight: 800 }}>
                      ⏳ {countdown.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${task.location.lat},${task.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Navigation size={14} /> Open GIS Route
                    </a>

                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleStartTask(task.id)}
                    >
                      <HardHat size={14} /> Start Repair On-Site
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}

        {activeTab === 'in_progress' && (
          inProgressTasks.length === 0 ? (
            <div style={{ background: 'var(--white)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
              <p style={{ color: 'var(--slate-500)', margin: 0 }}>No active on-site repairs in progress.</p>
            </div>
          ) : (
            inProgressTasks.map((task) => (
              <div key={task.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--civic-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--civic-700)' }}>
                    TASK #{task.id} • WORK IN PROGRESS
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {task.escalationState === 'REOPENED' && (
                      <span className="badge badge-escalation-reopened">⚠️ Reopened for Reinspection</span>
                    )}
                    <span className="badge badge-in_progress">On-Site Active</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '4px' }}>
                  {task.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                  <MapPin size={14} /> {task.location.address}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Repair Progress:</span>
                    <strong style={{ color: 'var(--civic-700)' }}>{task.progressPercent || 50}%</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${task.progressPercent || 50}%`, height: '100%', background: 'var(--civic-600)' }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedIncident(task)}
                    style={{ flex: 1 }}
                  >
                    View Details
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, background: '#059669', borderColor: '#059669' }}
                    onClick={() => handleOpenProofModal(task)}
                  >
                    <Upload size={14} /> Upload Completion Proof
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'completed' && (
          completedTasks.length === 0 ? (
            <div style={{ background: 'var(--white)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
              <p style={{ color: 'var(--slate-500)', margin: 0 }}>No completed work orders to display.</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div key={task.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#059669' }}>
                    TASK #{task.id} • RESOLVED / VERIFIED
                  </span>
                  <span className={`badge badge-${task.status.toLowerCase()}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '4px' }}>
                  {task.title}
                </h3>

                <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', margin: '4px 0 0.75rem 0' }}>
                  {task.location.address}
                </p>

                {task.evidence.afterPhotoUrl && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <BeforeAfterSlider
                      beforeUrl={task.evidence.beforePhotoUrl}
                      afterUrl={task.evidence.afterPhotoUrl}
                      address={task.location.address}
                    />
                  </div>
                )}

                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', background: 'var(--slate-50)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Logged by Squad:</strong> {task.workerNotes || 'Repairs validated.'}
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* MODAL: UPLOAD COMPLETION PROOF (Section 8) */}
      {isCapturingProof && selectedTask && (
        <div className="modal-backdrop" style={{ zIndex: 3500 }}>
          <div className="modal-container" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} style={{ color: '#059669' }} />
                <h3 className="card-title">Upload Repair Completion Proof</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCapturingProof(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                  Work Order #{selectedTask.id}: {selectedTask.title}
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  Location: {selectedTask.location.address}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Completion Photo Proof:
                </label>
                <input
                  type="text"
                  required
                  value={afterPhotoUrl}
                  onChange={(e) => setAfterPhotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
                {afterPhotoUrl && (
                  <img
                    src={afterPhotoUrl}
                    alt="Completion Proof"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '8px', border: '1px solid var(--slate-200)' }}
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Work Performed Summary:
                </label>
                <textarea
                  rows={2}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Materials & Machinery Logged:
                </label>
                <input
                  type="text"
                  value={materialsLogged}
                  onChange={(e) => setMaterialsLogged(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCapturingProof(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingProof}
                  onClick={() => handleSubmitProof(selectedTask.id)}
                  className="btn btn-primary"
                  style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
                >
                  {isSubmittingProof ? 'Submitting to Officer...' : 'Submit to Officer for Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
