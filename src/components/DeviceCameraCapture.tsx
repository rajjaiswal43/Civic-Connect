import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Upload, SwitchCamera, X, Image as ImageIcon } from 'lucide-react';
import { getExifGpsCoordinates } from '../utils/exifGps';

interface DeviceCameraCaptureProps {
  onPhotoCaptured: (
    photoDataUrl: string,
    provenance: 'live_camera' | 'gallery_upload',
    exifCoords?: { lat: number; lng: number }
  ) => void;
  onPhotoCleared?: () => void;
  categoryName?: string;
  initialPhotoUrl?: string | null;
}

export const DeviceCameraCapture: React.FC<DeviceCameraCaptureProps> = ({
  onPhotoCaptured,
  onPhotoCleared,
  categoryName = 'Civic Hazard',
  initialPhotoUrl = null
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhotoUrl || null);
  const [capturedProvenance, setCapturedProvenance] = useState<'live_camera' | 'gallery_upload'>('live_camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Sync if initialPhotoUrl changes
  useEffect(() => {
    if (initialPhotoUrl !== undefined) {
      setCapturedPhoto(initialPhotoUrl);
    }
  }, [initialPhotoUrl]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

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
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
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
          ? 'Camera permission denied. Please allow camera permissions in your browser or select an image file.'
          : 'No physical camera detected. You can select an image directly from your device.'
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
      setCapturedProvenance('live_camera');
      stopCamera();
      onPhotoCaptured(dataUrl, 'live_camera');
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    if (onPhotoCleared) onPhotoCleared();
    startCamera(facingMode);
  };

  // Clear photo
  const handleClear = () => {
    setCapturedPhoto(null);
    stopCamera();
    if (onPhotoCleared) onPhotoCleared();
  };

  // Switch between front and back camera
  const handleToggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Handle file upload from device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Try to extract real EXIF GPS if available
      let exifCoords: { lat: number; lng: number } | undefined = undefined;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const extracted = getExifGpsCoordinates(arrayBuffer);
        if (extracted) {
          exifCoords = extracted;
        }
      } catch (exifErr) {
        console.warn('Could not read EXIF data:', exifErr);
      }

      // 2. Read as data URL for preview and submission
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedPhoto(dataUrl);
        setCapturedProvenance('gallery_upload');
        stopCamera();
        onPhotoCaptured(dataUrl, 'gallery_upload', exifCoords);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so user can pick same file again if desired
    e.target.value = '';
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

      {/* VIEWFINDER / CAPTURE VIEWPORT */}
      <div
        style={{
          position: 'relative',
          height: '290px',
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

        {/* 1. STATE: PHOTO ALREADY CAPTURED (Real user photo) */}
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
                top: '12px',
                left: '12px',
                background: 'rgba(16, 185, 129, 0.92)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
              }}
            >
              <CheckCircle2 size={13} />
              <span>
                {capturedProvenance === 'live_camera'
                  ? 'Real-Time Camera Photo Captured ✓'
                  : 'Photo Uploaded from Device ✓'}
              </span>
            </div>

            {/* Top Right Action: Remove */}
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#ffffff',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
              title="Remove Photo"
            >
              <X size={16} />
            </button>

            {/* Bottom Actions: Retake */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px'
              }}
            >
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Retake with Camera
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer'
                }}
              >
                <Upload size={13} /> Change File
              </button>
            </div>
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
                border: '1px dashed rgba(255, 255, 255, 0.35)',
                borderRadius: 'var(--radius-md)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderTop: '3px solid #22c55e',
                  borderLeft: '3px solid #22c55e',
                  position: 'absolute',
                  top: '0',
                  left: '0'
                }}
              />
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderTop: '3px solid #22c55e',
                  borderRight: '3px solid #22c55e',
                  position: 'absolute',
                  top: '0',
                  right: '0'
                }}
              />
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderBottom: '3px solid #22c55e',
                  borderLeft: '3px solid #22c55e',
                  position: 'absolute',
                  bottom: '0',
                  left: '0'
                }}
              />
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderBottom: '3px solid #22c55e',
                  borderRight: '3px solid #22c55e',
                  position: 'absolute',
                  bottom: '0',
                  right: '0'
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.74rem', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>
                Center {categoryName} in camera
              </div>
            </div>

            {/* Live Camera Active Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#4ade80',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              LIVE CAMERA ACTIVE
            </div>

            {/* Camera Controls (Switch / Cancel) */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Switch Front/Back Camera"
              >
                <SwitchCamera size={15} />
              </button>

              <button
                type="button"
                onClick={stopCamera}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Close Camera"
              >
                <X size={15} />
              </button>
            </div>

            {/* Shutter Button */}
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '4px solid rgba(37, 99, 235, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 18px rgba(37, 99, 235, 0.6)',
                  cursor: 'pointer'
                }}
                title="Click to Capture Photo"
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--civic-600)'
                  }}
                />
              </button>
            </div>
          </div>
        ) : (
          /* 3. INITIAL UPLOAD SCREEN (Clean & Professional, Zero Fake Images) */
          <div
            style={{
              padding: '1.75rem 1.25rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              width: '100%',
              maxWidth: '420px'
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.15)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa'
              }}
            >
              <Camera size={34} />
            </div>

            <div>
              <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>
                Capture or Upload Issue Photo
              </h5>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Take a real picture using your device camera or select a photo file from your device.
              </p>
            </div>

            {cameraError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#fca5a5',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left'
                }}
              >
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Camera size={16} />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Upload size={16} />
                <span>Upload from Device</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions & Help */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--slate-500)'
        }}
      >
        <span>
          {capturedPhoto
            ? '✓ Evidence attached. Ready for location verification.'
            : '📸 Click "Capture Photo" to open your device camera, or "Upload from Device" to choose an image.'}
        </span>
        {capturedPhoto && (
          <span style={{ color: 'var(--emerald-600)', fontWeight: 800 }}>
            Photo Ready ✓
          </span>
        )}
      </div>
    </div>
  );
};
