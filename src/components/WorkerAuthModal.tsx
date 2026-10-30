import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { HardHat, CheckCircle2, ShieldCheck, X, Phone, UserCheck, Wrench } from 'lucide-react';

interface WorkerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WorkerAuthModal: React.FC<WorkerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { workers, authenticatedWorker, loginWorker, playSound } = useCivic();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    authenticatedWorker ? authenticatedWorker.id : (workers[0]?.id || 'w-1')
  );
  const [pinCode, setPinCode] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) {
      setErrorMsg('Selected worker profile not found.');
      return;
    }

    loginWorker(selectedWorkerId);
    playSound('success');
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 4000 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '520px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: 'var(--white)',
            padding: '1.25rem 1.5rem',
            borderBottom: '2px solid #f59e0b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.35)'
              }}
            >
              <HardHat size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(245, 158, 11, 0.25)',
                    color: '#fde68a',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}
                >
                  Municipal Field Workforce
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#6ee7b7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  Authorized Crew
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--white)', marginTop: '2px' }}>
                Field Worker Dispatch Login
              </h3>
            </div>
          </div>

          <button
            className="modal-close-btn"
            style={{ color: '#94a3b8', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', padding: '6px' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', margin: 0 }}>
            Select your assigned rapid response squad or maintenance crew to view assigned jobs, update site status, and upload completion proofs.
          </p>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '6px' }}>
                Select Field Worker Squad:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {workers.map((w) => {
                  const isSelected = selectedWorkerId === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorkerId(w.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--civic-600)' : '1px solid var(--slate-200)',
                        background: isSelected ? 'var(--civic-50)' : 'var(--white)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isSelected ? 'var(--civic-600)' : 'var(--slate-200)',
                            color: isSelected ? '#ffffff' : 'var(--slate-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem'
                          }}
                        >
                          {w.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--slate-900)' }}>{w.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                            {w.role} • {w.team}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'var(--amber-100)', color: 'var(--amber-800)', padding: '2px 6px', borderRadius: '4px' }}>
                          {w.currentTasksCount} tasks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                Crew Security PIN:
              </label>
              <input
                type="password"
                required
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="4-digit PIN"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '0.85rem',
                  letterSpacing: '0.2em'
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: '2px', display: 'block' }}>
                Default demo PIN: 1234
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem', fontWeight: 700, marginTop: '0.5rem', background: 'linear-gradient(135deg, #d97706, #b45309)', borderColor: '#b45309' }}
            >
              Sign In to Field Worker Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

