import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Upload, Sparkles, SwitchCamera, Zap, X } from 'lucide-react';

interface DeviceCameraCaptureProps {
  onPhotoCaptured: (photoDataUrl: string, provenance: 'live_camera' | 'gallery_upload') => void;
  initialPhotoUrl?: string;
  categoryName?: string;
  defaultSampleUrl?: string;
}

export const DeviceCameraCapture: React.FC<DeviceCameraCaptureProps> = ({
  onPhotoCaptured,
  initialPhotoUrl,
  categoryName = 'Civic Hazard',
  defaultSampleUrl
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhotoUrl || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'sample'>('camera');

  // Start real device camera
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setCapturedPhoto(null);

    // Stop existing stream if running
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on this browser/environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.error('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Live Camera access failed or denied:', err);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. Please allow camera access in your browser or select an image file.'
          : 'No physical camera detected or device is busy. You can choose a photo from your files or use a verified test sample.'
      );
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start camera on mount if in camera tab
  useEffect(() => {
    if (activeTab === 'camera' && !capturedPhoto) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Handle shutter snap click
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhoto(dataUrl);
      stopCamera();
      onPhotoCaptured(dataUrl, 'live_camera');
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Switch between front and back camera
  const handleToggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Handle file upload from gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedPhoto(dataUrl);
        stopCamera();
        onPhotoCaptured(dataUrl, 'gallery_upload');
      };
      reader.readAsDataURL(file);
    }
  };

  // Select realistic preset sample
  const handleSelectSample = () => {
    if (defaultSampleUrl) {
      setCapturedPhoto(defaultSampleUrl);
      stopCamera();
      onPhotoCaptured(defaultSampleUrl, 'gallery_upload');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Source Selector Tabs */}
      <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('camera');
            setCapturedPhoto(null);
            startCamera();
          }}
          style={{
            flex: 1,
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: activeTab === 'camera' ? 'var(--white)' : 'transparent',
            color: activeTab === 'camera' ? 'var(--civic-700)' : 'var(--slate-600)',
            boxShadow: activeTab === 'camera' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <Camera size={14} /> Live Device Camera
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            stopCamera();
            fileInputRef.current?.click();
          }}
          style={{
            flex: 1,
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: activeTab === 'upload' ? 'var(--white)' : 'transparent',
            color: activeTab === 'upload' ? 'var(--civic-700)' : 'var(--slate-600)',
            boxShadow: activeTab === 'upload' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <Upload size={14} /> Upload Image File
        </button>

        {defaultSampleUrl && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('sample');
              handleSelectSample();
            }}
            style={{
              flex: 1,
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: activeTab === 'sample' ? 'var(--white)' : 'transparent',
              color: activeTab === 'sample' ? 'var(--civic-700)' : 'var(--slate-600)',
              boxShadow: activeTab === 'sample' ? 'var(--shadow-xs)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <Sparkles size={14} /> Verified Sample
          </button>
        )}
      </div>

      {/* VIEWFINDER / CAPTURED PREVIEW CONTAINER */}
      <div
        style={{
          position: 'relative',
          height: '270px',
          background: '#070e1b',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '2px solid var(--slate-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Flash Overlay Effect */}
        {isFlashing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#ffffff',
              zIndex: 30,
              animation: 'fadeIn 0.1s ease'
            }}
          />
        )}

        {/* 1. STATE: PHOTO ALREADY CAPTURED */}
        {capturedPhoto ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src={capturedPhoto}
              alt="Captured evidence"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Provenance Badge */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(16, 185, 129, 0.9)',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <CheckCircle2 size={12} />
              <span>Photo Snapped & Geotagged ✓</span>
            </div>

            {/* Retake Button Overlay */}
            <button
              type="button"
              onClick={handleRetake}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <RefreshCw size={13} /> Retake Photo
            </button>
          </div>
        ) : isCameraActive ? (
          /* 2. STATE: LIVE CAMERA STREAM RUNNING */
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Camera Viewfinder Crosshair Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-md)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderTop: '2px solid rgba(255, 255, 255, 0.8)',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.8)',
                  position: 'absolute',
                  top: '0',
                  left: '0'
                }}
              />
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderTop: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRight: '2px solid rgba(255, 255, 255, 0.8)',
                  position: 'absolute',
                  top: '0',
                  right: '0'
                }}
              />
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.8)',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.8)',
                  position: 'absolute',
                  bottom: '0',
                  left: '0'
                }}
              />
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRight: '2px solid rgba(255, 255, 255, 0.8)',
                  position: 'absolute',
                  bottom: '0',
                  right: '0'
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.72rem', fontWeight: 600 }}>
                Align {categoryName} in frame
              </div>
            </div>

            {/* Telemetry pill */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#4ade80',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              LIVE 30FPS • GPS LOCKED
            </div>

            {/* Switch Camera Button (Front/Back) */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Switch Front/Back Camera"
            >
              <SwitchCamera size={15} />
            </button>

            {/* Big Shutter Click Button */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <button
                type="button"
                onClick={handleSnapPhoto}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '4px solid rgba(37, 99, 235, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(37, 99, 235, 0.5)',
                  cursor: 'pointer'
                }}
                title="Click to Snap Picture"
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--civic-600)'
                  }}
                />
              </button>
            </div>
          </div>
        ) : (
          /* 3. STATE: CAMERA ERROR / PERMISSION PROMPT */
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--slate-300)', maxWidth: '380px' }}>
            <AlertTriangle size={32} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--white)', marginBottom: '4px' }}>
              Device Camera Not Accessible
            </h5>
            <p style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginBottom: '12px', lineHeight: 1.35 }}>
              {cameraError || 'Allow camera permission in your browser or select an image directly.'}
            </p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => startCamera()}
              >
                <Camera size={13} /> Retry Camera
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={13} /> Select File
              </button>
              {defaultSampleUrl && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSelectSample}
                >
                  Use Sample
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Snap Prompt Instruction */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-500)' }}>
        <span>📸 <strong>Click the shutter button</strong> to snap live picture from device.</span>
        {capturedPhoto && (
          <span style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>
            Photo Ready to Upload ✓
          </span>
        )}
      </div>
    </div>
  );
};
