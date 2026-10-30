import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ShieldCheck,
  Lock,
  FileCode,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Bot,
  User,
  Building2,
  HardHat,
  EyeOff
} from 'lucide-react';
import { AuditLogEntry } from '../types';

export const AuditLogView: React.FC = () => {
  const { incidents } = useCivic();
  const [actorFilter, setActorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect all audit logs across all incidents and sort chronologically
  const allLogs: (AuditLogEntry & { incidentId: string; category: string })[] = [];
  incidents.forEach((inc) => {
    inc.auditLogs.forEach((log) => {
      allLogs.push({
        ...log,
        incidentId: inc.id,
        category: inc.category
      });
    });
  });

  const filteredLogs = allLogs.filter((log) => {
    const matchesActor = actorFilter === 'ALL' || log.role.includes(actorFilter);
    const matchesSearch =
      log.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesActor && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'var(--emerald-50)', color: 'var(--emerald-700)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--emerald-100)' }}>
              Tamper-Evident Event Ledger
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              DPDP Act 2023 Compliant Audit Log
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
            Municipal Audit Trail & Transparency Portal
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'var(--slate-100)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--slate-700)' }}>
          <Lock size={14} style={{ color: 'var(--civic-600)' }} />
          <span>SHA-256 State Hashing Active</span>
        </div>
      </div>

      {/* SECURITY & PRIVACY CONTROLS BANNER (Requirement 23) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
          border: '1px solid var(--civic-100)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ background: 'var(--civic-600)', color: 'var(--white)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <EyeOff size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              PII Separation & Masking
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              Citizen phone numbers & exact home geofences are masked in public feeds (DPDP Act 2023).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ background: 'var(--emerald-600)', color: 'var(--white)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Role-Based Access (RBAC)
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              Distinct authorization gates for Citizens, Municipal Triage Officers, and Field Crews.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ background: 'var(--purple-600)', color: 'var(--white)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <Bot size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              AI Governance & Override Trail
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              Every AI recommendation, model version, and human officer override requires mandatory logged justification.
            </p>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE & SEARCH */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} style={{ color: 'var(--civic-600)' }} />
            <h3 className="card-title">Live Event Stream ({filteredLogs.length} Entries)</h3>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem 0.45rem 2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.8rem'
              }}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)' }}>
            Filter by Actor:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'Citizen', 'AI System', 'Municipal Officer', 'Field Worker', 'Community'].map((act) => (
              <button
                key={act}
                onClick={() => setActorFilter(act)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: actorFilter === act ? 'var(--civic-600)' : 'var(--white)',
                  color: actorFilter === act ? 'var(--white)' : 'var(--slate-700)',
                  border: '1px solid var(--slate-300)'
                }}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.9rem 1.25rem',
                borderBottom: '1px solid var(--slate-100)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                background: log.overrideReason ? '#fffbeb' : 'var(--white)',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background:
                      log.role.includes('AI System')
                        ? 'var(--purple-100)'
                        : log.role === 'Municipal Officer'
                        ? 'var(--civic-100)'
                        : log.role === 'Field Worker'
                        ? 'var(--amber-100)'
                        : 'var(--emerald-100)',
                    color:
                      log.role.includes('AI System')
                        ? 'var(--purple-700)'
                        : log.role === 'Municipal Officer'
                        ? 'var(--civic-700)'
                        : log.role === 'Field Worker'
                        ? 'var(--amber-700)'
                        : 'var(--emerald-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {log.role.includes('AI System') ? (
                    <Bot size={16} />
                  ) : log.role === 'Municipal Officer' ? (
                    <Building2 size={16} />
                  ) : log.role === 'Field Worker' ? (
                    <HardHat size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--civic-700)' }}>
                      #{log.incidentId}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', background: 'var(--slate-100)', padding: '1px 6px', borderRadius: '4px' }}>
                      {log.role}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                    {log.details}
                  </p>

                  {/* Metadata Chips */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                    <span>Actor: <strong>{log.actor}</strong></span>
                    {log.modelVersion && <span>Model: <strong>{log.modelVersion}</strong></span>}
                    {log.confidence && <span>Confidence: <strong>{log.confidence}%</strong></span>}
                    {log.overrideReason && (
                      <span style={{ color: '#b45309', fontWeight: 700 }}>
                        ⚠️ Override Note: "{log.overrideReason}"
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
