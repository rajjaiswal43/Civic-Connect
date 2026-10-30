import React from 'react';
import { useCivic } from '../context/CivicContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  ShieldCheck,
  Building,
  Target
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { hotspots, incidents } = useCivic();

  const categoryStats = [
    { name: 'Pothole & Roads', count: 42, percentage: 33, color: '#2563eb' },
    { name: 'Garbage & Waste', count: 28, percentage: 22, color: '#d97706' },
    { name: 'Streetlights', count: 24, percentage: 19, color: '#eab308' },
    { name: 'Drainage & Sewage', count: 18, percentage: 14, color: '#059669' },
    { name: 'Water Leakages', count: 16, percentage: 12, color: '#06b6d4' }
  ];

  const wardStats = [
    { name: 'Ward 12 (Knowledge Park III)', count: 34, avgSla: '4.8h', compliance: '94%' },
    { name: 'Ward 8 (Pari Chowk & Alpha 1)', count: 29, avgSla: '6.2h', compliance: '91%' },
    { name: 'Ward 4 (Beta 2)', count: 25, avgSla: '5.5h', compliance: '93%' },
    { name: 'Ward 7 (Delta 1)', count: 22, avgSla: '7.1h', compliance: '89%' },
    { name: 'Ward 15 (Surajpur)', count: 18, avgSla: '8.4h', compliance: '86%' }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER WITH GNIDA MUNICIPAL TELEMETRY HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              GNIDA Municipal Operations Telemetry
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Greater Noida Zone 1 Real-time Performance & Asset Intelligence
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
            Civic Operations & Infrastructure Intelligence
          </h2>
        </div>

        <div style={{ background: 'var(--slate-100)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
          Reporting Cycle: <strong>August 2026 (Monsoon Zone)</strong>
        </div>
      </div>

      {/* CORE PERFORMANCE METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Median Triage Time
          </span>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--civic-600)', marginTop: '2px' }}>
            4.2 mins
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
            Automated Edge AI Classification
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Correct Routing Rate
          </span>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '2px' }}>
            96.4%
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
            PostGIS Geofence + Dept Mapping
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Duplicate Consolidation
          </span>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--purple-600)', marginTop: '2px' }}>
            38.2%
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--purple-700)', fontWeight: 600 }}>
            128 work orders from 207 reports
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            SLA Compliance Rate
          </span>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
            91.8%
          </p>
          <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
            Within target hours
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Citizen Verification Rate
          </span>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
            98.1%
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
            Closed with photo proof audit
          </span>
        </div>
      </div>

      {/* TWO COLUMN CHARTS & BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* INCIDENTS BY CATEGORY */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 size={18} style={{ color: 'var(--civic-600)' }} />
              Incidents by Civic Category
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>128 Incidents</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{cat.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{cat.count} ({cat.percentage}%)</span>
                </div>
                <div style={{ height: '10px', background: 'var(--slate-100)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${cat.percentage * 2.5}%`,
                      height: '100%',
                      background: cat.color,
                      borderRadius: '5px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WARD PERFORMANCE & SLA BREAKDOWN */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Building size={18} style={{ color: 'var(--civic-600)' }} />
              Ward SLA Compliance & Triage Speed
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Greater Noida Sectors</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            {wardStats.map((ward) => (
              <div
                key={ward.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-200)',
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--slate-900)' }}>{ward.name}</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                    Active Load: {ward.count} incidents | Avg Triage SLA: {ward.avgSla}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--emerald-700)', fontWeight: 700, fontSize: '0.82rem' }}>
                    {ward.compliance}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--slate-400)' }}>
                    Compliance
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECURRING HOTSPOTS & CAPITAL PLANNING SIGNALS (Requirement 20) */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} style={{ color: '#ef4444' }} />
              <h3 className="card-title">
                Recurring Hotspot Intelligence & Capital Works Advisory
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Clusters with high repeat failure patterns signaling underlying structural civil works
            </p>
          </div>

          <span style={{ fontSize: '0.7rem', background: 'var(--civic-50)', color: 'var(--civic-800)', border: '1px solid var(--civic-200)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            GNIDA Capital Planning Engine
          </span>
        </div>

        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {hotspots.map((hs) => (
            <div
              key={hs.id}
              style={{
                border: hs.riskLevel === 'CRITICAL' ? '1px solid #fecaca' : '1px solid #fed7aa',
                background: hs.riskLevel === 'CRITICAL' ? '#fff5f5' : '#fffaf0',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {hs.name}
                </h4>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: hs.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                    color: '#ffffff'
                  }}
                >
                  {hs.riskLevel}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                Ward: <strong>{hs.ward}</strong> | Recurring Issue: <strong>{hs.category} ({hs.incidentCount} reports)</strong>
              </div>

              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.85)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.06)', fontSize: '0.72rem', color: 'var(--slate-700)', lineHeight: 1.35 }}>
                🏗️ <strong>Recommended Action:</strong> {hs.suggestedCapitalWork}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
