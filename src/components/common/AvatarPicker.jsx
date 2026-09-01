import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, ImagePlus, RotateCcw, Check, X } from 'lucide-react';
import UserAvatar, { AVATAR_PRESETS } from './UserAvatar';
import { useTranslation } from '../../hooks/useTranslation';

const MAX_DIM = 320;

function resizeToDataUrl(source, sw, sh) {
  const scale = Math.min(1, MAX_DIM / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

const TABS = [
  { id: 'avatar', labelKey: 'avatarTab', icon: ImagePlus },
  { id: 'camera', labelKey: 'takePhotoTab', icon: Camera },
  { id: 'upload', labelKey: 'uploadPhotoTab', icon: Upload }
];

export default function AvatarPicker({ value, fullName, onChange }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('avatar');
  const [stream, setStream] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const handleStartCamera = async () => {
    setCameraError('');
    setCapturedPreview(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t('cameraNotAvailable'));
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
    } catch (err) {
      setCameraError(t('cameraPermissionDenied'));
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const dataUrl = resizeToDataUrl(video, video.videoWidth, video.videoHeight);
    setCapturedPreview(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    handleStartCamera();
  };

  const handleConfirmCaptured = () => {
    onChange(capturedPreview);
    setCapturedPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const dataUrl = resizeToDataUrl(img, img.naturalWidth, img.naturalHeight);
        onChange(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 min-w-0">
        <UserAvatar avatar={value} fullName={fullName} className="w-16 h-16 rounded-full object-cover shrink-0 overflow-hidden" />
        <div className="flex flex-wrap gap-2 flex-1 min-w-[180px]">
          {TABS.map((tabItem) => {
            const Icon = tabItem.icon;
            const active = tab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => { setTab(tabItem.id); setCameraError(''); if (tabItem.id !== 'camera') stopCamera(); }}
                className="btn whitespace-normal text-center !min-h-11 !px-3 text-xs sm:text-[13px] flex-1 min-w-[100px]"
                style={active ? { background: 'var(--ember)', color: '#1a0f08' } : { background: 'transparent', border: '1px solid var(--hairline-strong)', color: 'var(--ink-soft)' }}
              >
                <Icon className="w-4 h-4 shrink-0" /> {t(tabItem.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'avatar' && (
        <div className="grid grid-cols-6 gap-3" role="group" aria-label={t('chooseAvatarAria')}>
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(`preset:${preset.id}`)}
              aria-label={`Avatar option ${preset.id}`}
              aria-pressed={value === `preset:${preset.id}`}
              className="aspect-square rounded-full grid place-items-center text-2xl transition-transform hover:scale-105 active:scale-95"
              style={{
                background: preset.bg,
                outline: value === `preset:${preset.id}` ? `2px solid var(--ember)` : '1px solid var(--hairline-strong)',
                outlineOffset: '2px'
              }}
            >
              {preset.emoji}
            </button>
          ))}
        </div>
      )}

      {tab === 'camera' && (
        <div>
          {capturedPreview ? (
            <div className="space-y-3">
              <img src={capturedPreview} alt="Captured preview" className="w-full max-w-xs mx-auto rounded-[var(--radius-md)] object-cover" style={{ aspectRatio: '1' }} />
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleRetake} className="btn btn-line whitespace-normal flex-1 min-w-[120px]"><RotateCcw className="w-4 h-4" /> {t('retakeLabel')}</button>
                <button type="button" onClick={handleConfirmCaptured} className="btn btn-ember whitespace-normal flex-1 min-w-[120px]"><Check className="w-4 h-4" /> {t('usePhotoLabel')}</button>
              </div>
            </div>
          ) : stream ? (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-xs mx-auto rounded-[var(--radius-md)] object-cover" style={{ aspectRatio: '1' }} />
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={stopCamera} className="btn btn-line whitespace-normal flex-1 min-w-[120px]"><X className="w-4 h-4" /> {t('cancel')}</button>
                <button type="button" onClick={handleCapture} className="btn btn-ember whitespace-normal flex-1 min-w-[120px]"><Camera className="w-4 h-4" /> {t('captureLabel')}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cameraError && <p className="text-sm" style={{ color: 'var(--alert)' }}>{cameraError}</p>}
              <button type="button" onClick={handleStartCamera} className="btn btn-line whitespace-normal w-full">
                <Camera className="w-4 h-4" /> {t('startCamera')}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" aria-label={t('uploadProfilePhotoAria')} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-line whitespace-normal text-center w-full">
            <Upload className="w-4 h-4 shrink-0" /> {t('choosePhotoFromDevice')}
          </button>
        </div>
      )}
    </div>
  );
}
