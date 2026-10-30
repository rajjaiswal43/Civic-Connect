import React, { useState } from 'react';
import { CivicIncident, PriorityLevel, IncidentCategory } from '../types';
import { useCivic } from '../context/CivicContext';
import {
  Sliders,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Edit3,
  X
} from 'lucide-react';
import { SAMPLE_DEPARTMENTS } from '../data/seedData';

interface PriorityScoreExplainerProps {
  incident: CivicIncident;
  allowOfficerOverride?: boolean;
}

export const PriorityScoreExplainer: React.FC<PriorityScoreExplainerProps> = ({
  incident,
  allowOfficerOverride = true
}) => {
  const { overrideAiRecommendation, currentRole } = useCivic();
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState<IncidentCategory>(incident.category);
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>(incident.priorityLevel);
  const [overrideDepartment, setOverrideDepartment] = useState<string>(incident.department);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { priorityBreakdown, priorityScore, priorityLevel } = incident;

  const handleApplyOverride = () => {
    if (!overrideReason.trim()) {
      setErrorMsg('Mandatory: Please provide a clear administrative justification for this override.');
      return;
    }

    let calculatedScore = priorityScore;
    if (overridePriority === 'CRITICAL') calculatedScore = 95;
    else if (overridePriority === 'HIGH') calculatedScore = 84;
    else if (overridePriority === 'MEDIUM') calculatedScore = 62;
    else calculatedScore = 42;

    overrideAiRecommendation(incident.id, {
      category: overrideCategory,
      priorityLevel: overridePriority,
      priorityScore: calculatedScore,
      department: overrideDepartment,
      reason: overrideReason
    });

    setShowOverrideModal(false);
    setErrorMsg('');
  };

  const getPriorityColor = () => {
    if (priorityLevel === 'CRITICAL') return '#ef4444';
    if (priorityLevel === 'HIGH') return '#f59e0b';
    if (priorityLevel === 'MEDIUM') return '#eab308';
    return '#64748b';
  };

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--slate-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'var(--amber-50)', color: 'var(--amber-600)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <Sliders size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Explainable 6-Factor Priority Formula (Page 11)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Weighted multi-factor objective risk computation (Priority ≠ Number of Likes)
            </p>
          </div>
        </div>

        {/* Score Pill */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: getPriorityColor()
            }}
          >
            {priorityScore}/100
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: getPriorityColor(),
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {priorityLevel} PRIORITY
          </span>
        </div>
      </div>

      {/* 6-Factor Breakdown Progress Bars (Page 11) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {/* 1. Severity (30%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>1. Safety Severity (Physical hazard / size):</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{priorityBreakdown.severity}/30 pts (Weight: 30%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(priorityBreakdown.severity / 30) * 100}%`,
                height: '100%',
                background: '#ef4444',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* 2. Public Impact (20%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>2. Public Impact (Traffic / daily footfall):</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{priorityBreakdown.publicImpact}/20 pts (Weight: 20%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(priorityBreakdown.publicImpact / 20) * 100}%`,
                height: '100%',
                background: '#f59e0b',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* 3. Vulnerability (15%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>3. Vulnerable / Safety Context (Near school / hospital):</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{priorityBreakdown.vulnerability}/15 pts (Weight: 15%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(priorityBreakdown.vulnerability / 15) * 100}%`,
                height: '100%',
                background: '#3b82f6',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* 4. Corroboration (15%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>4. Corroboration ('Still exists' public signal):</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{priorityBreakdown.corroboration}/15 pts (Weight: 15%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(priorityBreakdown.corroboration / 15) * 100}%`,
                height: '100%',
                background: '#10b981',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* 5. Persistence / Age (10%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>5. Persistence & Age (Days active / repeat report):</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{priorityBreakdown.persistence}/10 pts (Weight: 10%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(priorityBreakdown.persistence / 10) * 100}%`,
                height: '100%',
                background: '#8b5cf6',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* 6. Location Context (10%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>6. Location & Service Context (Arterial corridor):</span>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{priorityBreakdown.locationContext}/10 pts (Weight: 10%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(priorityBreakdown.locationContext / 10) * 100}%`,
                height: '100%',
                background: '#06b6d4',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Human in the loop callout & Override Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--slate-50)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: 'var(--civic-600)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
            AI recommendation generated via calibrated weights. <strong>Human Review & Officer Override enabled.</strong>
          </span>
        </div>

        {allowOfficerOverride && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowOverrideModal(true)}
            style={{ flexShrink: 0, gap: '4px' }}
          >
            <Edit3 size={13} />
            <span>Officer Override</span>
          </button>
        )}
      </div>

      {/* OVERRIDE MODAL */}
      {showOverrideModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} style={{ color: 'var(--amber-600)' }} />
                Administrative Officer Override
              </h3>
              <button className="modal-close-btn" onClick={() => setShowOverrideModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                You are modifying the AI triage parameters for Incident <strong>#{incident.id}</strong>. All adjustments are logged into the immutable audit ledger.
              </p>

              {errorMsg && (
                <div style={{ background: 'var(--crimson-50)', color: 'var(--crimson-700)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                  {errorMsg}
                </div>
              )}

              {/* Priority Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Override Priority Level:
                </label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value as PriorityLevel)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                >
                  <option value="CRITICAL">CRITICAL (Direct Emergency Hazard)</option>
                  <option value="HIGH">HIGH (Major Traffic / Risk)</option>
                  <option value="MEDIUM">MEDIUM (Standard Queue)</option>
                  <option value="LOW">LOW (Scheduled Maintenance)</option>
                </select>
              </div>

              {/* Department Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Re-Route Responsible Department:
                </label>
                <select
                  value={overrideDepartment}
                  onChange={(e) => setOverrideDepartment(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                >
                  {SAMPLE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Reason for Override (Mandatory) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Mandatory Override Justification (Saved in Audit Trail):
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., VIP dignitary route tomorrow morning / Secondary inspection revealed water pipe under road..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowOverrideModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApplyOverride}>
                Commit Override & Update Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
