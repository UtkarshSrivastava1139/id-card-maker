import { useState, useEffect, useRef, useCallback } from 'react';
import { useMobileCaptureStore } from '../../store/mobileCaptureStore';
import { Camera, RefreshCcw, Download, List, ChevronLeft, ChevronRight } from 'lucide-react';
import MobileReviewView from './MobileReviewView';
import MobileQueueView from './MobileQueueView';

interface MobileCameraViewProps {
  onGoToExport: () => void;
}

export default function MobileCameraView({ onGoToExport }: MobileCameraViewProps) {
  const { sessionPayload, records, updateRecordStatus } = useMobileCaptureStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  const [currentRecordIndex, setCurrentRecordIndex] = useState(() => {
    const firstPending = records.findIndex(r => r.status === 'pending');
    return firstPending >= 0 ? firstPending : 0;
  });

  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [showQueue, setShowQueue] = useState(false);

  const currentRecord = records[currentRecordIndex];
  const sessionRecord = sessionPayload?.records.find(r => r.recordId === currentRecord?.recordId);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setReviewPhoto(dataUrl);
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleSavePhoto = async (dataUrl: string) => {
    if (!currentRecord) return;
    
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const filename = `${currentRecord.recordId}.jpg`;
      
      updateRecordStatus(currentRecord.recordId, 'captured', blob, filename);
      setReviewPhoto(null);
      
      // Auto-advance
      goToNextPending();
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to save photo locally.");
    }
  };

  const goToNextPending = () => {
    const nextIndex = records.findIndex((r, idx) => idx > currentRecordIndex && r.status === 'pending');
    if (nextIndex !== -1) {
      setCurrentRecordIndex(nextIndex);
    } else {
      // Loop back to start to find pending
      const firstPending = records.findIndex(r => r.status === 'pending');
      if (firstPending !== -1 && firstPending !== currentRecordIndex) {
        setCurrentRecordIndex(firstPending);
      } else {
        alert("All students processed!");
        onGoToExport();
      }
    }
  };

  const handleSkip = () => {
    if (currentRecord) {
      updateRecordStatus(currentRecord.recordId, 'skipped', null, null);
      goToNextPending();
    }
  };

  if (!sessionPayload || !currentRecord || !sessionRecord) return null;

  if (reviewPhoto) {
    return (
      <MobileReviewView 
        photoUrl={reviewPhoto} 
        onRetake={() => setReviewPhoto(null)} 
        onSave={() => handleSavePhoto(reviewPhoto)} 
        record={sessionRecord}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      
      {/* Top Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}>
        <button onClick={() => setShowQueue(true)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <List size={24} />
        </button>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '100px', display: 'inline-block' }}>
            {currentRecordIndex + 1} / {records.length}
          </div>
        </div>
        <button onClick={onGoToExport} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Download size={24} />
        </button>
      </div>

      {/* Camera View */}
      <div style={{ flex: 1, backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
        {hasPermission === false && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: 'white' }}>
            <p style={{ marginBottom: '16px' }}>Camera access denied or unavailable.</p>
            <button onClick={startCamera} style={{ padding: '12px 24px', background: 'white', color: 'black', borderRadius: '8px', border: 'none', fontWeight: 600 }}>Retry Camera</button>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Framing Guide */}
        <div style={{ position: 'absolute', inset: '15% 15%', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '16px', pointerEvents: 'none' }} />
      </div>

      {/* Bottom Controls */}
      <div style={{ background: '#1e293b', padding: '24px 16px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        
        {/* Student Info */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{sessionRecord.displayData.title}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#cbd5e1' }}>{sessionRecord.displayData.subtitle}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>{sessionRecord.displayData.details}</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          <button onClick={handleSkip} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', fontWeight: 500, padding: '12px' }}>
            Skip
          </button>
          
          <button 
            onClick={handleCapture}
            style={{ 
              width: '72px', height: '72px', borderRadius: '50%', 
              background: 'white', border: '4px solid #cbd5e1', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <Camera size={32} color="#0f172a" />
          </button>
          
          <button onClick={handleSwitchCamera} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCcw size={20} />
          </button>
        </div>

        {/* Manual Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
          <button 
            onClick={() => setCurrentRecordIndex(prev => Math.max(0, prev - 1))}
            disabled={currentRecordIndex === 0}
            style={{ background: 'transparent', border: 'none', color: currentRecordIndex === 0 ? '#475569' : '#94a3b8', padding: '8px', display: 'flex' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => setCurrentRecordIndex(prev => Math.min(records.length - 1, prev + 1))}
            disabled={currentRecordIndex === records.length - 1}
            style={{ background: 'transparent', border: 'none', color: currentRecordIndex === records.length - 1 ? '#475569' : '#94a3b8', padding: '8px', display: 'flex' }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>

      {showQueue && (
        <MobileQueueView 
          currentIndex={currentRecordIndex}
          onSelect={(idx) => { setCurrentRecordIndex(idx); setShowQueue(false); }}
          onClose={() => setShowQueue(false)}
        />
      )}

    </div>
  );
}
