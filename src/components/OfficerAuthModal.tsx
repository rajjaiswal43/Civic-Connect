import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { OfficerAccount } from '../types';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Award
} from 'lucide-react';

interface OfficerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OfficerAuthModal: React.FC<OfficerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    loginOfficer,
    registerOfficer,
    authenticatedOfficer,
    logoutOfficer,
    playSound
  } = useCivic();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('officer.chauhan@gnida.in');
  const [loginPassword, setLoginPassword] = useState('officer123');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form state
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [department, setDepartment] = useState('Public Works & Roads Maintenance Division');
  const [designation, setDesignation] = useState('Assistant Engineer (Civil)');
  const [jurisdiction, setJurisdiction] = useState('Zone 1 (Wards 1–15, Greater Noida)');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [autoApproveByAdmin, setAutoApproveByAdmin] = useState(true);

  // Feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await loginOfficer(loginEmail, loginPassword);
      if (res.success) {
        playSound('success');
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        playSound('alert');
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg('Login failed: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!fullName.trim() || fullName.length < 3) {
      setErrorMsg('Please enter your full legal name (at least 3 characters).');
      return;
    }
    const cleanPhone = mobile.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit official mobile number.');
      return;
    }
    if (!officialEmail.includes('@') || !officialEmail.includes('.')) {
      setErrorMsg('Please enter a valid official government or department email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters with mixed credentials.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMsg('Password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerOfficer({
        name: fullName.trim(),
        mobile: cleanPhone,
        email: officialEmail.trim().toLowerCase(),
        department,
        designation,
        jurisdiction,
        password: regPassword,
        autoApprove: autoApproveByAdmin
      });

      if (res.success) {
        playSound('success');
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (res.requiresApproval) {
            setMode('login');
          } else {
            onClose();
            if (onSuccess) onSuccess();
          }
        }, 1200);
      } else {
        playSound('alert');
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg('Registration failed: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('officer123');
    playSound('click');
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 4000 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '560px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #091e3a, #132f57, #1e3a8a)',
            color: 'var(--white)',
            padding: '1.25rem 1.5rem',
            borderBottom: '2px solid #3b82f6'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.35)',
                color: '#1e293b'
              }}
            >
              <ShieldCheck size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}
                >
                  Municipal Command Gateway
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
                  NIC Verified
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--white)', marginTop: '2px' }}>
                Government Officer Authentication Portal
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '4px 1rem', borderBottom: '1px solid var(--slate-200)' }}>
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.65rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: mode === 'login' ? 'var(--white)' : 'transparent',
              color: mode === 'login' ? 'var(--civic-700)' : 'var(--slate-600)',
              boxShadow: mode === 'login' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <KeyRound size={15} />
            <span>Officer Sign In</span>
          </button>

          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.65rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: mode === 'register' ? 'var(--white)' : 'transparent',
              color: mode === 'register' ? 'var(--civic-700)' : 'var(--slate-600)',
              boxShadow: mode === 'register' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <User size={15} />
            <span>New Officer Registration</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Official Email Address:
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
                  <input
                    type="email"
                    required
                    placeholder="officer.chauhan@gnida.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-300)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '4px' }}>
                  Secure Password:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 2.25rem 0.55rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-300)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-400)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Quick Preset Officers */}
              <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Demo Accounts (Pre-Verified Municipal Executives):
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('officer.chauhan@gnida.in')}
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'var(--white)',
                      border: '1px solid var(--civic-200)',
                      color: 'var(--civic-800)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Er. R. B. Chauhan (Roads & Zone 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('officer.sanitation@gnida.in')}
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'var(--white)',
                      border: '1px solid var(--slate-300)',
                      color: 'var(--slate-700)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Sanitary Officer Verma (Sanitation)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--slate-600)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember session for future logins</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem', fontWeight: 700 }}
              >
                {isSubmitting ? 'Authenticating with NIC Directory...' : 'Sign In as Government Officer'}
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTRATION */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                    Full Legal Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Er. Rajeshwar Singh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                    Official Mobile Number:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                  Official Email Address (@gov.in, @nic.in, or municipal):
                </label>
                <input
                  type="email"
                  required
                  placeholder="r.singh@gnida.in"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                    Department:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                  >
                    <option value="Roads & Public Works Department">Roads & Public Works Department</option>
                    <option value="Sanitation & Solid Waste Management">Sanitation & Solid Waste Management</option>
                    <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
                    <option value="Water Supply & Sewage Department">Water Supply & Sewage Department</option>
                    <option value="Drainage & Manhole Infrastructure">Drainage & Manhole Infrastructure</option>
                    <option value="Civil Assets & Traffic Safety">Civil Assets & Traffic Safety</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                    Official Designation:
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                  >
                    <option value="Executive Engineer (Civil)">Executive Engineer (Civil)</option>
                    <option value="Assistant Engineer (Civil)">Assistant Engineer (Civil)</option>
                    <option value="Junior Engineer (Works)">Junior Engineer (Works)</option>
                    <option value="Zonal Sanitary Officer">Zonal Sanitary Officer</option>
                    <option value="Chief Electrical Inspector">Chief Electrical Inspector</option>
                    <option value="Zonal Administrative Officer">Zonal Administrative Officer</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                  Assigned Area, Ward, or Jurisdiction:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Zone 1 (Wards 1–15: Knowledge Park, Pari Chowk, Alpha, Beta)"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                    Password:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '3px' }}>
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* Administrative Verification Option */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                  border: '1px solid #bbf7d0',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', display: 'block' }}>
                    Administrative Clearance / Verification
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#15803d' }}>
                    Auto-grant authorized officer clearance for instant portal review
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoApproveByAdmin}
                    onChange={(e) => setAutoApproveByAdmin(e.target.checked)}
                  />
                  <span>Verify Now</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem', fontWeight: 700 }}
              >
                {isSubmitting ? 'Registering with Municipal Cadre...' : 'Register Officer Credentials'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

