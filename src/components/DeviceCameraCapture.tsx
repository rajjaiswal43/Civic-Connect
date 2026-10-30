import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Upload, SwitchCamera, X, Eye } from 'lucide-react';
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
  const systemCameraInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhotoUrl || null);
  const [capturedProvenance, setCapturedProvenance] = useState<'live_camera' | 'gallery_upload'>('live_camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Sync if initialPhotoUrl changes
  useEffect(() => {
    if (initialPhotoUrl !== undefined) {
      setCapturedPhoto(initialPhotoUrl);
    }
  }, [initialPhotoUrl]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Ensure video element receives the stream when mounted
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      if (node.srcObject !== stream) {
        node.srcObject = stream;
      }
      node.play().catch((err) => console.warn('Video auto-play interrupted:', err));
    }
  }, [stream]);

  // Additional check when stream or isCameraActive changes
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
    }
  }, [isCameraActive, stream]);

  // Helper to stop live camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start real device camera with progressive fallbacks
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('In-browser camera streaming is not supported on this browser. Please use the "Upload Photo" or "Device Camera" button below.');
      return;
    }

    try {
      let mediaStream: MediaStream;

      // 1. Try with ideal facingMode and resolution
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (firstErr) {
        console.warn('Preferred camera constraints failed, attempting fallback to generic video:', firstErr);
        // 2. Fallback to generic video (essential for MacBooks/laptops without back camera)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setStream(mediaStream);
      setIsCameraActive(true);
      setCapturedPhoto(null);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Please grant camera permission in your browser address bar or select a photo file from your device.');
      } else {
        setCameraError('Unable to open live video stream. You can upload or take a photo using the buttons below.');
      }
    }
  };

  // Snap photo from live video feed
  const handleSnapPhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.error('Video or canvas element unavailable');
      return;
    }

    // Flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const width = video.videoWidth || video.clientWidth || 1280;
    const height = video.videoHeight || video.clientHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      setCapturedPhoto(dataUrl);
      setCapturedProvenance('live_camera');
      stopCamera();
      onPhotoCaptured(dataUrl, 'live_camera');
    }
  };

  // Switch camera front/back
  const handleToggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Process uploaded image file with downscaling & EXIF extraction
  const processImageFile = async (file: File) => {
    setIsProcessingFile(true);
    setCameraError(null);

    try {
      // 1. Extract EXIF GPS coordinates if present
      let exifCoords: { lat: number; lng: number } | undefined = undefined;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const extracted = getExifGpsCoordinates(arrayBuffer);
        if (extracted) {
          exifCoords = extracted;
        }
      } catch (exifErr) {
        console.warn('Could not parse EXIF:', exifErr);
      }

      // 2. Load into Image object and resize via Canvas for fast web performance
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let w = img.width;
          let h = img.height;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = canvasRef.current || document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setCapturedPhoto(optimizedDataUrl);
            setCapturedProvenance('gallery_upload');
            stopCamera();
            onPhotoCaptured(optimizedDataUrl, 'gallery_upload', exifCoords);
          } else {
            // Fallback to raw data url if canvas context fails
            setCapturedPhoto(rawDataUrl);
            setCapturedProvenance('gallery_upload');
            stopCamera();
            onPhotoCaptured(rawDataUrl, 'gallery_upload', exifCoords);
          }
          setIsProcessingFile(false);
        };
        img.onerror = () => {
          setIsProcessingFile(false);
          setCameraError('Failed to read image file. Please try another image.');
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => {
        setIsProcessingFile(false);
        setCameraError('Failed to load image from your device.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error handling file:', err);
      setIsProcessingFile(false);
      setCameraError('Error processing photo file. Please try again.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleClearPhoto = () => {
    setCapturedPhoto(null);
    stopCamera();
    if (onPhotoCleared) {
      onPhotoCleared();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input for file picker */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Hidden file input for native device camera */}
      <input
        type="file"
        ref={systemCameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* VIEWFINDER / CAPTURE VIEWPORT */}
      <div
        style={{
          position: 'relative',
          height: '320px',
          background: '#090d16',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '2px solid var(--slate-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Flash Animation */}
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

        {/* 1. STATE: REAL PHOTO CAPTURED */}
        {capturedPhoto ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src={capturedPhoto}
              alt="Captured evidence"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Verification Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(16, 185, 129, 0.95)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <CheckCircle2 size={14} />
              <span>
                {capturedProvenance === 'live_camera'
                  ? 'Real Camera Photo Captured ✓'
                  : 'Photo Attached from Device ✓'}
              </span>
            </div>

            {/* Remove / Clear Button */}
            <button
              type="button"
              onClick={handleClearPhoto}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#ffffff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
              }}
              title="Remove Photo"
            >
              <X size={16} />
            </button>

            {/* Action Bar at Bottom of Image */}
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
                onClick={() => startCamera(facingMode)}
                style={{
                  background: 'rgba(15, 23, 42, 0.92)',
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
                  background: 'rgba(15, 23, 42, 0.92)',
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
                <Upload size={13} /> Change Image
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          /* 2. STATE: LIVE CAMERA STREAM RUNNING */
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch((e) => console.warn('Play error:', e));
                }
              }}
            />

            {/* Target Crosshair */}
            <div
              style={{
                position: 'absolute',
                inset: '24px',
                border: '1px dashed rgba(255, 255, 255, 0.35)',
                borderRadius: 'var(--radius-md)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ width: '24px', height: '24px', borderTop: '3px solid #22c55e', borderLeft: '3px solid #22c55e', position: 'absolute', top: 0, left: 0 }} />
              <div style={{ width: '24px', height: '24px', borderTop: '3px solid #22c55e', borderRight: '3px solid #22c55e', position: 'absolute', top: 0, right: 0 }} />
              <div style={{ width: '24px', height: '24px', borderBottom: '3px solid #22c55e', borderLeft: '3px solid #22c55e', position: 'absolute', bottom: 0, left: 0 }} />
              <div style={{ width: '24px', height: '24px', borderBottom: '3px solid #22c55e', borderRight: '3px solid #22c55e', position: 'absolute', bottom: 0, right: 0 }} />
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.74rem', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: '4px' }}>
                Center {categoryName} in frame
              </div>
            </div>

            {/* Live Camera Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(15, 23, 42, 0.88)',
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
              LIVE WEBCAM / CAMERA
            </div>

            {/* Switch Camera / Close Camera Buttons */}
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
                title="Switch Camera (Front / Back)"
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
                title="Cancel Camera"
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
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '4px solid rgba(37, 99, 235, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.6)',
                  cursor: 'pointer'
                }}
                title="Capture Photo"
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--civic-600)'
                  }}
                />
              </button>
            </div>
          </div>
        ) : (
          /* 3. INITIAL SCREEN (Clean & Modern Web Portal UI) */
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
              maxWidth: '480px'
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
              <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>
                Capture or Upload Evidence Photo
              </h5>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                Take a photo using your camera or select an existing photo file from your device.
              </p>
            </div>

            {isProcessingFile && (
              <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>
                Processing and optimizing image...
              </div>
            )}

            {cameraError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#fca5a5',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left'
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Action Buttons: Web Camera, Device Camera, and File Upload */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', width: '100%', marginTop: '0.35rem' }}>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="btn btn-primary"
                style={{
                  flex: '1 1 180px',
                  padding: '0.7rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Camera size={16} />
                <span>Open Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => systemCameraInputRef.current?.click()}
                className="btn btn-secondary"
                style={{
                  flex: '1 1 140px',
                  padding: '0.7rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                title="Open device camera"
              >
                <Camera size={16} />
                <span>Device Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{
                  flex: '1 1 140px',
                  padding: '0.7rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Upload size={16} />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--slate-500)',
          padding: '0 2px'
        }}
      >
        <span>
          {capturedPhoto
            ? '✓ Photo evidence verified and attached. Ready to proceed to location.'
            : '📸 Use "Open Live Camera" to snap with your webcam, or "Upload File" to choose a photo.'}
        </span>
        {capturedPhoto && (
          <span style={{ color: 'var(--emerald-600)', fontWeight: 800 }}>
            Ready to Continue &rarr;
          </span>
        )}
      </div>
    </div>
  );
};
