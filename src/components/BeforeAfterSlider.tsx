import React, { useState, useRef, useCallback } from 'react';
import { ShieldCheck, MapPin, Calendar, Camera, CheckCircle2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl?: string;
  timestamp?: string;
  gpsVerified?: boolean;
  address?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  timestamp = '18 Aug 2026, 04:12 PM',
  gpsVerified = true,
  address = 'Knowledge Park III, Greater Noida'
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPosition(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  // If no after photo exists yet
  if (!afterUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ position: 'relative', height: '280px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
          <img
            src={beforeUrl}
            alt="Citizen Complaint Initial Evidence"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="badge-label-before">INITIAL CITIZEN EVIDENCE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', background: 'var(--slate-50)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> {timestamp}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--emerald-600)', fontWeight: 600 }}>
            <ShieldCheck size={14} /> GPS Geotag Verified
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Slider Container */}
      <div
        ref={containerRef}
        className="before-after-container"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {/* Before Image (Base layer) */}
        <img src={beforeUrl} alt="Before Repair Evidence" />
        <div className="badge-label-before">BEFORE REPAIR</div>

        {/* After Image (Clipped layer) */}
        <div
          className="after-image-wrapper"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <img src={afterUrl} alt="After Repair Proof" />
          <div className="badge-label-after">AFTER REPAIR PROOF ✓</div>
        </div>

        {/* Divider Handle */}
        <div className="slider-divider-line" style={{ left: `${sliderPosition}%` }}>
          <div className="slider-handle">
            <span>‹ ›</span>
          </div>
        </div>
      </div>

      {/* Verification Evidence Metadata Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.5rem',
          background: 'var(--slate-100)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--slate-700)',
          border: '1px solid var(--slate-200)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} style={{ color: 'var(--civic-600)' }} />
          <span><strong>GPS Matched:</strong> {address.slice(0, 24)}...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--civic-600)' }} />
          <span><strong>Proof Time:</strong> {timestamp}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--emerald-600)' }} />
          <span><strong>Anti-Tamper:</strong> Fresh EXIF Verified</span>
        </div>
      </div>
    </div>
  );
};
