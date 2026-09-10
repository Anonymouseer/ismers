import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ProfilePhotoModal.css';

/**
 * ProfilePhotoModal
 *
 * Provides two options for personal avatar acquisition:
 * 1. "Upload from Device" (file system picker with MIME and size defense)
 * 2. "Take Photo with Camera" (live HTML5 getUserMedia webcam capture with portrait guide)
 */
export default function ProfilePhotoModal({
  isOpen,
  onClose,
  currentPhoto = null,
  onSavePhoto,
  onRemovePhoto,
}) {
  const [step, setStep] = useState('select'); // 'select' | 'camera' | 'preview'
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop active camera stream safely
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setStep('select');
      setPreviewPhoto(null);
      setCameraError(null);
    }
  }, [isOpen, stopCameraStream]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId = null) => {
    stopCameraStream();
    setCameraLoading(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser environment.');
      }

      const constraints = {
        video: {
          width: { ideal: 720 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'user',
          deviceId: deviceId ? { exact: deviceId } : undefined,
        },
        audio: false,
      };

      const streamPromise = navigator.mediaDevices.getUserMedia(constraints);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const timeoutErr = new Error('Camera initialization timed out.');
          timeoutErr.name = 'TimeoutError';
          reject(timeoutErr);
        }, 8000);
      });

      const mediaStream = await Promise.race([streamPromise, timeoutPromise]);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Enumerate available video input devices
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);
        if (!deviceId && videoInputs.length > 0) {
          const activeTrack = mediaStream.getVideoTracks()[0];
          const activeSettings = activeTrack?.getSettings();
          if (activeSettings?.deviceId) {
            setSelectedDeviceId(activeSettings.deviceId);
          }
        }
      } catch {
        // Non-blocking device enumeration failure
      }
    } catch (err) {
      let friendlyMsg = 'Unable to access the device camera. Please check your system permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMsg = 'Camera permission was denied. Please grant camera access in your browser settings to continue.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMsg = 'No operational camera device was detected on your current system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyMsg = 'Your camera is currently in use by another application. Please close other camera tabs or tools and retry.';
      } else if (err.name === 'TimeoutError') {
        friendlyMsg = 'Camera initialization timed out. Please verify that your webcam is connected and allowed by your system.';
      }
      setCameraError(friendlyMsg);
    } finally {
      setCameraLoading(false);
    }
  }, [stopCameraStream]);

  // Start camera when entering 'camera' step
  useEffect(() => {
    if (step === 'camera' && isOpen) {
      startCamera(selectedDeviceId);
    } else {
      stopCameraStream();
    }
  }, [step, isOpen, selectedDeviceId, startCamera, stopCameraStream]);

  // Switch between cameras (if multiple exist)
  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    if (nextDevice) {
      setSelectedDeviceId(nextDevice.deviceId);
    }
  };

  // Helper: crop and compress image to 400x400 square data URL
  const cropToSquareDataUrl = (imgOrVideo, isVideo = false) => {
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const srcW = isVideo ? imgOrVideo.videoWidth : imgOrVideo.naturalWidth || imgOrVideo.width;
    const srcH = isVideo ? imgOrVideo.videoHeight : imgOrVideo.naturalHeight || imgOrVideo.height;

    const minDim = Math.min(srcW, srcH);
    const startX = (srcW - minDim) / 2;
    const startY = (srcH - minDim) / 2;

    if (isVideo) {
      // Mirror horizontal for natural selfie view
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(imgOrVideo, startX, startY, minDim, minDim, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  // Capture photo from video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;
    try {
      const dataUrl = cropToSquareDataUrl(videoRef.current, true);
      stopCameraStream();
      setPreviewPhoto(dataUrl);
      setStep('preview');
    } catch {
      setCameraError('An unexpected error occurred while capturing the photo frame.');
    }
  };

  // Handle local file selection from device
  const handleDeviceFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      alert('Invalid file format. Please choose an image file (JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB maximum limit. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        const squaredDataUrl = cropToSquareDataUrl(img, false);
        setPreviewPhoto(squaredDataUrl);
        setStep('preview');
      };
      img.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Confirm photo application
  const handleConfirmSave = () => {
    if (previewPhoto && onSavePhoto) {
      onSavePhoto(previewPhoto);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="ppm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ppm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ppm-header">
          <div className="ppm-header-left">
            <div className="ppm-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="ppm-title-wrap">
              <h2 className="ppm-title">
                {step === 'select' && 'Personal Profile Photo'}
                {step === 'camera' && 'Live Camera Capture'}
                {step === 'preview' && 'Review Profile Photo'}
              </h2>
              <p className="ppm-subtitle">
                {step === 'select' && 'Choose a source to update your administrative avatar.'}
                {step === 'camera' && 'Center your face within the guide ring and capture.'}
                {step === 'preview' && 'Verify appearance before saving to your profile.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ppm-close-btn"
            onClick={onClose}
            title="Close dialog"
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="ppm-body">
          {/* STEP 1: SELECT SOURCE */}
          {step === 'select' && (
            <>
              {/* Hidden file picker input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDeviceFileSelect}
              />

              <div className="ppm-options-grid">
                {/* Option 1: Upload from Device */}
                <button
                  type="button"
                  className="ppm-option-card"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <div className="ppm-option-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="ppm-option-text">
                    <span className="ppm-option-title">Upload from Device</span>
                    <span className="ppm-option-desc">Select an image file (JPG, PNG, WEBP) from your computer or mobile storage</span>
                  </div>
                  <div className="ppm-option-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>

                {/* Option 2: Take Photo with Device Camera */}
                <button
                  type="button"
                  className="ppm-option-card"
                  onClick={() => setStep('camera')}
                >
                  <div className="ppm-option-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className="ppm-option-text">
                    <span className="ppm-option-title">Take Photo with Camera</span>
                    <span className="ppm-option-desc">Use your device webcam or integrated camera directly with a live viewfinder</span>
                  </div>
                  <div className="ppm-option-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>

                {/* Option 3: Remove Current Photo (if set) */}
                {currentPhoto && (
                  <button
                    type="button"
                    className="ppm-option-card ppm-remove-card"
                    onClick={() => {
                      if (onRemovePhoto) onRemovePhoto();
                      onClose();
                    }}
                  >
                    <div className="ppm-option-icon-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                    <div className="ppm-option-text">
                      <span className="ppm-option-title">Remove Current Photo</span>
                      <span className="ppm-option-desc">Reset your profile icon back to default initial lettering</span>
                    </div>
                    <div className="ppm-option-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>

              <div className="ppm-policy-note">
                <strong>PRIMEPOWER Governance Policy:</strong> Profile photos must represent authorized personnel in professional corporate attire. Images are secured and stored in accordance with RA 10173 data privacy requirements.
              </div>
            </>
          )}

          {/* STEP 2: LIVE CAMERA VIEWFINDER */}
          {step === 'camera' && (
            <div className="ppm-camera-container">
              {cameraError ? (
                <div className="ppm-error-box">
                  <span className="ppm-error-title">Camera Initialization Notice</span>
                  <p className="ppm-error-msg">{cameraError}</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 6 }}>
                    <button
                      type="button"
                      className="ppm-btn-secondary"
                      onClick={() => setStep('select')}
                    >
                      Back to Options
                    </button>
                    <button
                      type="button"
                      className="ppm-btn-primary"
                      onClick={() => startCamera(selectedDeviceId)}
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ppm-viewfinder-wrap">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="ppm-video-feed"
                    />

                    {cameraLoading && (
                      <div className="ppm-guide-overlay">
                        <div className="ppm-spinner" />
                      </div>
                    )}

                    {!cameraLoading && (
                      <div className="ppm-guide-overlay">
                        <div className="ppm-guide-circle" />
                        <div className="ppm-guide-text">Position face inside circle</div>
                      </div>
                    )}
                  </div>

                  {/* Camera Control Bar */}
                  <div className="ppm-camera-controls">
                    {/* Back to selection */}
                    <button
                      type="button"
                      className="ppm-aux-btn"
                      onClick={() => {
                        stopCameraStream();
                        setStep('select');
                      }}
                      title="Back to options"
                      aria-label="Back to options"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      className="ppm-shutter-btn"
                      onClick={handleCapturePhoto}
                      disabled={cameraLoading}
                      title="Capture photo"
                      aria-label="Capture photo"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>

                    {/* Flip Camera (if multi-camera device) */}
                    {devices.length > 1 ? (
                      <button
                        type="button"
                        className="ppm-aux-btn"
                        onClick={handleSwitchCamera}
                        title="Switch camera device"
                        aria-label="Switch camera device"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 4 1 10 7 10" />
                          <polyline points="23 20 23 14 17 14" />
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                        </svg>
                      </button>
                    ) : (
                      <div style={{ width: 42, height: 42 }} />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: SNAPSHOT REVIEW */}
          {step === 'preview' && (
            <div className="ppm-preview-container">
              <div className="ppm-preview-avatar-box">
                {previewPhoto && (
                  <img
                    src={previewPhoto}
                    alt="Captured profile preview"
                    className="ppm-preview-img"
                  />
                )}
              </div>

              <div className="ppm-preview-actions">
                <button
                  type="button"
                  className="ppm-btn-secondary"
                  onClick={() => {
                    setPreviewPhoto(null);
                    setStep('camera');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Retake Photo
                </button>

                <button
                  type="button"
                  className="ppm-btn-primary"
                  onClick={handleConfirmSave}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Use This Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
