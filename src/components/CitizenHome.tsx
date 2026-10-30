import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { CivicMap } from './CivicMap';
import { IncidentCategory, CivicIncident } from '../types';
import {
  PlusCircle,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  Layers,
  ChevronRight,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Flame,
  Search,
  Filter,
  Star,
  Bell,
  Check,
  Building2,
  Calendar
} from 'lucide-react';

export const CitizenHome: React.FC = () => {
  const {
    incidents,
    hotspots,
    setSelectedIncident,
    setIsReportModalOpen,
    votePublicValidation,
    toggleFollowIncident
  } = useCivic();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImpactScore, setSelectedImpactScore] = useState<Record<string, number>>({});
  const [feedbackComment, setFeedbackComment] = useState<Record<string, string>>({});

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Issues' },
    { id: 'Pothole', label: 'Potholes' },
    { id: 'Streetlight', label: 'Streetlights' },
    { id: 'Garbage', label: 'Garbage' },
    { id: 'Water Leakage', label: 'Water Leak' },
    { id: 'Drainage', label: 'Drainage' },
    { id: 'Footpath', label: 'Footpaths' },
    { id: 'Public Asset', label: 'Public Assets' },
  ];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || inc.category === selectedCategoryFilter;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myReports = incidents.slice(0, 3);
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;
  const inProgressCount = incidents.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;

  const handleVoteImpact = (incidentId: string, rating: number) => {
    setSelectedImpactScore((prev) => ({ ...prev, [incidentId]: rating }));
    votePublicValidation(
      incidentId,
      'confirmed_exists',
      rating,
      feedbackComment[incidentId] || 'Citizen corroborated physical impact'
    );
  };

  const handleDisputeLocation = (incidentId: string) => {
    votePublicValidation(
      incidentId,
      'not_present_wrong_location',
      1,
      'Citizen reported issue not present at marked location'
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* CITIZEN GREETING & LOCATION HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-900), #172554)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          color: 'var(--white)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(147, 197, 253, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> Greater Noida, Ward 12 (Knowledge Park III)
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: 600 }}>
              ✓ Verified OTP User (Raj / Priya)
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px' }}>
            Report, Track & Verify Civic Infrastructure
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-300)', maxWidth: '540px', lineHeight: 1.4 }}>
            Spot a pothole, leaking pipe, or dark street? Capture photo proof, watch AI consolidate duplicates, track official SLA deadlines, and verify the final repair before closure.
          </p>
        </div>

        {/* Primary Report CTA */}
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setIsReportModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--civic-600), #1d4ed8)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            padding: '0.85rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          <PlusCircle size={20} />
          <span>Report a Civic Issue</span>
        </button>
      </div>

      {/* QUICK METRICS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            My Active Reports
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
            {myReports.length}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--civic-600)', fontWeight: 600 }}>
            Geotagged & Tracked
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            In Progress Repairs
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: '2px' }}>
            {inProgressCount}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
            Crews dispatched on-site
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Verified Resolved
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-600)', marginTop: '2px' }}>
            {resolvedCount}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
            Citizen Verified ✓
          </span>
        </div>

        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Duplicate Redundancy Saved
          </span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--purple-600)', marginTop: '2px' }}>
            38.2%
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
            via AI cluster merging
          </span>
        </div>
      </div>

      {/* INTERACTIVE NEARBY CIVIC INCIDENTS GIS RADAR MAP */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Radio size={18} style={{ color: 'var(--civic-600)' }} />
              Nearby Civic Incidents Radar Map
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Live geospatial radar centered on Greater Noida (Click any pin to inspect evidence & corroborate)
            </p>
          </div>

          {/* Category Filter Pills & Live GPS Badge */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', overflowX: 'auto', maxWidth: '60%' }}>
            <span style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.15)', color: '#15803d', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
              GPS Locked: Knowledge Park III
            </span>
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: selectedCategoryFilter === cat.id ? 'var(--civic-600)' : 'var(--slate-100)',
                  color: selectedCategoryFilter === cat.id ? 'var(--white)' : 'var(--slate-700)'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0.75rem' }}>
          <CivicMap
            incidents={filteredIncidents}
            hotspots={hotspots}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="380px"
          />
        </div>
      </div>

      {/* TWO COLUMN SECTION: ACTIVE REPORTS & STRUCTURED COMMUNITY VALIDATION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* COLUMN 1: TRACK MY REPORTS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} style={{ color: 'var(--civic-600)' }} />
              Track My Active Reports
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Realtime SLA Timeline</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            {myReports.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-200)',
                  background: 'var(--slate-50)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--civic-500)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--slate-200)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--civic-700)' }}>
                      #{inc.id}
                    </span>
                    <span className={`badge badge-${inc.status.toLowerCase()}`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>

                  {inc.escalationState !== 'NONE' && (
                    <span className={`badge badge-escalation-${inc.escalationState.toLowerCase()}`}>
                      ⚠️ {inc.escalationState.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {inc.title}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  <span>Dept: <strong>{inc.department}</strong></span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--civic-600)', fontWeight: 600 }}>
                    Inspect Timeline <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: STRUCTURED COMMUNITY VALIDATION FEED (Page 6) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ThumbsUp size={18} style={{ color: 'var(--emerald-600)' }} />
                Public Review & Validation Hub
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                Corroborate local impact without turning priority into a popularity contest (Page 6)
              </p>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem' }}>
            {incidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-200)',
                  background: 'var(--white)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <img
                    src={inc.evidence.beforePhotoUrl}
                    alt={inc.title}
                    style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--civic-700)' }}>
                        #{inc.id} • {inc.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--emerald-700)', fontWeight: 600 }}>
                        {inc.communityConfirmations} verified active
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px', lineHeight: 1.3 }}>
                      {inc.title}
                    </p>
                  </div>
                </div>

                {/* Structured Rating Actions (Page 6) */}
                <div style={{ background: 'var(--slate-50)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Rate Safety/Movement Impact (1-5):</span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleVoteImpact(inc.id, star)}
                          style={{
                            color: (selectedImpactScore[inc.id] || inc.averageImpactRating) >= star ? '#f59e0b' : 'var(--slate-300)',
                            padding: '1px'
                          }}
                          title={`Impact Score ${star}/5`}
                        >
                          <Star size={14} fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-200)', paddingTop: '6px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-success"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => handleVoteImpact(inc.id, 5)}
                      >
                        <ThumbsUp size={12} /> Still Exists
                      </button>

                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={() => handleDisputeLocation(inc.id)}
                        title="Flag for officer re-verification"
                      >
                        <ThumbsDown size={12} /> Not Present
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={() => toggleFollowIncident(inc.id)}
                      >
                        <Bell size={12} style={{ color: inc.isFollowing ? 'var(--civic-600)' : 'inherit' }} />
                        <span>{inc.isFollowing ? 'Following' : 'Follow'}</span>
                      </button>

                      <button
                        className="btn btn-sm btn-primary"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
                        onClick={() => setSelectedIncident(inc)}
                      >
                        View Proof
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          RECENTLY COMPLETED CIVIC WORK (Section 9)
         ------------------------------------------------------------- */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} style={{ color: '#059669' }} />
              <h3 className="card-title" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--slate-900)' }}>
                Recently Completed Civic Work
              </h3>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid #86efac' }}>
                Officer Verified ✓
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', margin: '3px 0 0 0' }}>
              Public showcase of verified field infrastructure repairs inspected by zonal officers and closed by citizen verification.
            </p>
          </div>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid #a7f3d0' }}>
            {incidents.filter((i) => (i.status === 'RESOLVED' || i.evidence.afterPhotoUrl) && i.status !== 'REJECTED').length} Issues Resolved
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {incidents
            .filter((i) => (i.status === 'RESOLVED' || i.evidence.afterPhotoUrl) && i.status !== 'REJECTED')
            .slice(0, 4)
            .map((work) => (
              <div
                key={work.id}
                onClick={() => setSelectedIncident(work)}
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(5, 150, 105, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--slate-200)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Before / After Split Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '140px', position: 'relative' }}>
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={work.evidence.beforePhotoUrl}
                      alt="Before"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px' }}>
                      BEFORE
                    </span>
                  </div>

                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={work.evidence.afterPhotoUrl || work.evidence.beforePhotoUrl}
                      alt="After"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(5,150,105,0.85)', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px' }}>
                      AFTER
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                      #{work.id}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={10} /> Officer Verified
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--civic-700)', textTransform: 'uppercase' }}>
                        {work.category}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {work.evidence.photoTimestamp?.split(',')[0] || 'Recently'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-900)', margin: '4px 0 2px 0', lineHeight: 1.3 }}>
                      {work.title}
                    </h4>

                    <p style={{ fontSize: '0.74rem', color: 'var(--slate-500)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {work.location.ward || work.location.address}
                      </span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-200)', paddingTop: '6px', marginTop: '4px', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--slate-600)', fontWeight: 600 }}>
                      Dept: <strong>{work.department}</strong>
                    </span>
                    <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      View Details <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
