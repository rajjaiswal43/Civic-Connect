import React, { useState, useEffect } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  X,
  Bot,
  Cpu,
  Scan
} from 'lucide-react';
import { CivicIncident } from '../types';

interface AIVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: CivicIncident | null;
}

export const AIVerificationModal: React.FC<AIVerificationModalProps> = ({
  isOpen,
  onClose,
  incident
}) => {
  const { incidents, setSelectedIncident, playSound } = useCivic();
  const targetIncident = incident || incidents.find((i) => i.id === 'CC-1042') || incidents[0];

  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isProcessingComplete, setIsProcessingComplete] = useState<boolean>(false);

  const verificationStages = [
    { label: 'Evidence received & anti-tamper check passed', detail: 'EXIF timestamp & SHA-256 cryptographic hash validated' },
    { label: 'GPS coordinates & municipal geofence validated', detail: 'Knowledge Park III, Ward 12 (Accuracy: ±3.2m)' },
    { label: 'Image relevance & clarity analyzed', detail: 'CV model confirmed clear asphalt road disruption (Relevance: 98%)' },
    { label: 'Issue category classified via YOLOv9', detail: 'Predicted: Pothole / Severe Road Depression (Confidence: 94%)' },
    { label: 'Nearby PostGIS spatio-temporal cluster searched', detail: '3 similar citizen reports identified within 100m radius' },
    { label: 'Explainable 6-factor priority score computed', detail: 'Calculated: 86/100 (HIGH PRIORITY — High student transit corridor)' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      setIsProcessingComplete(false);
      return;
    }

    playSound('scan');

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < verificationStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsProcessingComplete(true);
          playSound('success');
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !targetIncident) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: 'var(--slate-900)', color: 'var(--white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.3)', color: '#60a5fa', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(96, 165, 250, 0.4)' }}>
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)' }}>
                {isProcessingComplete ? 'AI Verification & Duplicate Cluster Detected' : 'AI Verification Pipeline Active...'}
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                Multi-Signal Edge AI Verification Pipeline (CivicVision v1.4b)
              </p>
            </div>
          </div>
          <button className="modal-close-btn" style={{ color: 'var(--slate-400)' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Animated Verification Stages */}
          <div
            style={{
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              border: '1px solid var(--slate-200)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {verificationStages.map((stage, idx) => {
                const isPassed = currentStage >= idx;
                const isCurrent = currentStage === idx && !isProcessingComplete;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      opacity: isPassed ? 1 : 0.35,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isPassed ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)' }} />
                      ) : (
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--slate-300)' }} />
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isPassed ? 700 : 500,
                          color: isPassed ? 'var(--slate-900)' : 'var(--slate-500)'
                        }}
                      >
                        {stage.label}
                      </span>
                      {isPassed && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '1px' }}>
                          {stage.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Result Card (Shows once pipeline completes) */}
          {isProcessingComplete && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
              {/* Metrics Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ background: 'var(--civic-50)', border: '1px solid var(--civic-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--civic-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                    AI Classification
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--civic-900)', marginTop: '2px' }}>
                    {targetIncident.category}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--civic-600)', fontWeight: 700 }}>
                    94% Confidence
                  </span>
                </div>

                <div style={{ background: 'var(--emerald-50)', border: '1px solid var(--emerald-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--emerald-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Evidence Quality
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--emerald-900)', marginTop: '2px' }}>
                    Live Proof
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--emerald-600)', fontWeight: 700 }}>
                    98% Relevance
                  </span>
                </div>

                <div style={{ background: 'var(--amber-50)', border: '1px solid var(--amber-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--amber-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Priority Score
                  </span>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--amber-900)', marginTop: '2px' }}>
                    86 / 100
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--amber-600)', fontWeight: 700 }}>
                    HIGH PRIORITY
                  </span>
                </div>
              </div>

              {/* Duplicate Clustering Alert (Pages 3 & 11) */}
              <div
                style={{
                  background: 'var(--purple-50)',
                  border: '1px solid #d8b4fe',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                  <Layers size={18} style={{ color: 'var(--purple-700)' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#581c87' }}>
                    Spatio-Temporal Duplicate Cluster Identified!
                  </h4>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b21a8', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  PostGIS discovered <strong>3 corroborating citizen reports</strong> for this road defect within 100 meters. These have been consolidated into <strong>Master Incident #{targetIncident.id}</strong> to create a single, fast municipal work order.
                </p>

                {/* 3 Candidate Reports */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ background: 'var(--white)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span><strong>Report #CC-1042:</strong> Knowledge Park Gate 2</span>
                    <span style={{ color: 'var(--slate-500)' }}>Distance: <strong>48 m</strong> | 2 hrs ago</span>
                  </div>
                  <div style={{ background: 'var(--white)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span><strong>Report #CC-1047:</strong> Bus Stand Crossing</span>
                    <span style={{ color: 'var(--slate-500)' }}>Distance: <strong>71 m</strong> | 4 hrs ago</span>
                  </div>
                  <div style={{ background: 'var(--white)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span><strong>Report #CC-1051:</strong> University Corner</span>
                    <span style={{ color: 'var(--slate-500)' }}>Distance: <strong>93 m</strong> | 5 hrs ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {isProcessingComplete && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedIncident(targetIncident);
                onClose();
              }}
            >
              <span>View Incident Details</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
