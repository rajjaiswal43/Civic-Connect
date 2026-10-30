import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Building2,
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface OfficerLoginPageProps {
  onLoginSuccess?: () => void;
  onNavigateHome?: () => void;
}

export const OfficerLoginPage: React.FC<OfficerLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const { loginOfficer, playSound } = useCivic();

  // Inputs
  const [fullName, setFullName] = useState<string>('Yash Kumar');
  const [mobileNumber, setMobileNumber] = useState<string>('9761003007');
  const [password, setPassword] = useState<string>('yash@specify23');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full official name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginOfficer(fullName.trim(), mobileNumber.trim(), password, rememberMe);
      if (res.success) {
        playSound('success');
        setSuccessMessage(res.message || 'Authorization confirmed. Redirecting to Officer Command Centre...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/officer/dashboard');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }, 500);
      } else {
        playSound('alert');
        setErrorMessage(res.message || 'Invalid credentials. Please verify your Name, Mobile Number, and Password.');
      }
    } catch (err: any) {
      playSound('alert');
      setErrorMessage(err.message || 'Invalid officer credentials. Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = () => {
    setFullName('Yash Kumar');
    setMobileNumber('9761003007');
    setPassword('yash@specify23');
    setErrorMessage(null);
  };

  const handleBackToCitizen = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--slate-200)',
          overflow: 'hidden'
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy-900), #1e3a8a)',
            padding: '1.75rem 1.5rem',
            color: 'var(--white)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <button
            onClick={handleBackToCitizen}
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Return to Citizen Portal"
          >
            <ArrowLeft size={13} />
            <span>Citizen Portal</span>
          </button>

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <ShieldAlert size={28} style={{ color: '#ffffff' }} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', color: '#93c5fd', border: '1px solid rgba(147, 197, 253, 0.3)', marginBottom: '6px' }}>
            CIVIC CONNECT • MUNICIPAL ADMINISTRATION
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '2px 0 4px 0', letterSpacing: '-0.01em' }}>
            Officer Command Portal
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-300)', margin: 0 }}>
            Authorized Government Officer Verification & Jurisdiction Command
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid var(--slate-200)',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem'
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: 'var(--slate-700)', display: 'block' }}>
              Authorized Demo Officer:
            </span>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.7rem' }}>
              Yash Kumar (9761003007)
            </span>
          </div>

          <button
            type="button"
            onClick={autofillDemo}
            style={{
              background: 'var(--civic-50)',
              border: '1px solid var(--civic-300)',
              color: 'var(--civic-700)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <KeyRound size={12} />
            <span>Fill Credentials</span>
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                color: '#991b1b',
                fontSize: '0.8rem',
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Authentication Error:</strong>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#166534',
                fontSize: '0.8rem'
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--slate-700)',
                  marginBottom: '5px'
                }}
              >
                <User size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Full Official Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Yash Kumar"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--slate-700)',
                  marginBottom: '5px'
                }}
              >
                <Phone size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Official Mobile Number (10 digits)</span>
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 9761003007"
                maxLength={10}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--slate-700)',
                  marginBottom: '5px'
                }}
              >
                <Lock size={13} style={{ color: 'var(--civic-600)' }} />
                <span>Officer Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authorized password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-300)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-400)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--slate-700)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--civic-600)' }}
                />
                <span>Remember me on this municipal workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, var(--civic-600), #1d4ed8)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.8 : 1
              }}
            >
              {isSubmitting ? (
                <>Verifying Authorized Credentials...</>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Authorize & Enter Command Center</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--slate-200)',
              textAlign: 'center',
              fontSize: '0.7rem',
              color: 'var(--slate-500)',
              lineHeight: 1.4
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--slate-600)', fontWeight: 600, marginBottom: '2px' }}>
              <ShieldCheck size={12} style={{ color: '#059669' }} /> Government of India • Municipal Technology Framework
            </div>
            <div>
              Restricted to verified public works executive engineers and zonal authorities.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

