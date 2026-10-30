import React from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  X,
  Award,
  Layers,
  Lock,
  CheckCircle,
  FileText,
  BadgeCheck
} from 'lucide-react';

interface OfficerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficerProfileModal: React.FC<OfficerProfileModalProps> = ({ isOpen, onClose }) => {
  const { officerProfile } = useCivic();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 3500 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '680px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Official Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #091e3a, #132f57, #1e3a8a)',
            color: 'var(--white)',
            padding: '1.25rem 1.5rem',
            borderBottom: '2px solid #3b82f6',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.4)',
                flexShrink: 0,
                color: '#1e293b'
              }}
            >
              <Award size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    border: '1px solid rgba(147, 197, 253, 0.3)'
                  }}
                >
                  Government of Uttar Pradesh • Urban Development
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#6ee7b7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={11} />
                  NIC e-Pramaan Verified
                </span>
              </div>

              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--white)', marginTop: '3px', letterSpacing: '-0.01em' }}>
                Official Municipal Officer Identity & Credentials
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '1px' }}>
                Greater Noida Industrial Development Authority (GNIDA) • Zonal Secretariat
              </p>
            </div>
          </div>

          <button
            className="modal-close-btn"
            style={{ color: '#94a3b8', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', padding: '6px' }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          {/* Executive Smart ID Card Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Hologram strip decoration */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '6px',
                height: '100%',
                background: 'linear-gradient(to bottom, #3b82f6, #10b981, #f59e0b, #ec4899)'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Photo Avatar / Seal */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    border: '3px solid #ffffff'
                  }}
                >
                  {officerProfile.name.split(' ').map((n) => n[0]).filter(Boolean).slice(-2).join('') || 'RC'}
                </div>
                <span
                  style={{
                    fontSize: '0.62rem',
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    border: '1px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <BadgeCheck size={11} /> ACTIVE
                </span>
              </div>

              {/* Main Credential Info */}
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
                    {officerProfile.name}
                  </h4>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: 'var(--civic-100)',
                      color: 'var(--civic-800)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    ID: {officerProfile.badge_number}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--civic-700)', marginTop: '3px' }}>
                  {officerProfile.designation}
                </p>

                <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px', fontWeight: 500 }}>
                  {officerProfile.department}
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    marginTop: '8px',
                    fontSize: '0.72rem',
                    color: 'var(--slate-700)',
                    border: '1px solid var(--slate-200)'
                  }}
                >
                  <MapPin size={12} style={{ color: 'var(--civic-600)' }} />
                  <strong>Jurisdiction:</strong> {officerProfile.zone}
                </div>
              </div>
            </div>
          </div>

          {/* Official Attributes Grid (Read-Only) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.85rem'
            }}
          >
            {/* Item: Service Cadre */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                <Briefcase size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Service Cadre & Class</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>
                UP State Engineering Service (CES) • Class-I Gazetted
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Authority: Department of Housing & Urban Planning
              </span>
            </div>

            {/* Item: Shift Status */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                <Clock size={13} style={{ color: '#059669' }} />
                <span>Operational Duty Shift</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', marginTop: '4px' }}>
                {officerProfile.shift_status}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Command Center: Greater Noida Zone 1 Control Desk
              </span>
            </div>

            {/* Item: Direct Hotline */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                <Phone size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Direct Secretariat Phone</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {officerProfile.phone}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Civic Dispatch Extension: 4022 (Triage Operations)
              </span>
            </div>

            {/* Item: Official Email */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                <Mail size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Official Government Email</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {officerProfile.email}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Encrypted via NIC GovMail Infrastructure
              </span>
            </div>

            {/* Item: Statutory Authority Delegation */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                <FileText size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Statutory Delegation</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>
                UP Municipal Corporation Act, 1959 (§112)
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Emergency Public Infrastructure Works Sanction
              </span>
            </div>

            {/* Item: Digital Signature & PKI */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                <ShieldCheck size={13} style={{ color: '#059669' }} />
                <span>Digital Signatory Status</span>
              </div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', marginTop: '4px' }}>
                Class 3 DSC Validated • SHA-256
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Certificate Token: NIC-UP-GNIDA-7729-A
              </span>
            </div>
          </div>

          {/* Physical Secretariat Address */}
          <div
            style={{
              background: '#f8fafc',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              fontSize: '0.75rem',
              color: 'var(--slate-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MapPin size={16} style={{ color: 'var(--civic-600)', flexShrink: 0 }} />
            <div>
              <strong>Administrative Headquarters:</strong>{' '}
              {officerProfile.office_address || 'GNIDA Administrative Complex, Sector Knowledge Park IV, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh 201310'}
            </div>
          </div>

          {/* Real-World Security Integrity Notice */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              border: '1px solid #bbf7d0',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <Lock size={16} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.72rem', color: '#166534', lineHeight: 1.45 }}>
              <strong>Municipal Integrity Notice:</strong> Officer credentials and jurisdictional assignments are verified through the National Informatics Centre (NIC) Single Sign-On (SSO) directory. In accordance with UP Urban Development statutory standards, municipal officer details are immutable and cannot be altered via client workstations.
            </div>
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--slate-200)'
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ padding: '0.55rem 1.4rem', fontSize: '0.82rem', fontWeight: 700 }}
            >
              Close Official Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
