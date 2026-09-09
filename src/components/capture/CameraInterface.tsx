import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCcw, Save, SkipForward, ArrowLeft, Upload } from 'lucide-react';
import Button from '../ui/Button';
import { useCaptureStore } from '../../store/captureStore';
import { savePhotoToDirectory } from '../../services/fileSystem';

interface CameraInterfaceProps {
  mode: 'single' | 'bulk';
  initialRecordId: string;
  onClose: () => void;
}

export default function CameraInterface({ mode, initialRecordId, onClose }: CameraInterfaceProps) {
  const { records, directoryHandle, updateRecordStatus } = useCaptureStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentRecordId, setCurrentRecordId] = useState(initialRecordId);
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const currentRecord = records.find(r => r.recordId === currentRecordId);
  const currentIndex = records.findIndex(r => r.recordId === currentRecordId);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (deviceId?: string) => {
    setError(null);
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' })
        } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        if (activeTrack) {
          const trackDeviceId = activeTrack.getSettings().deviceId;
          if (trackDeviceId) {
            setSelectedDeviceId(trackDeviceId);
          } else {
            setSelectedDeviceId(videoDevices[0].deviceId);
          }
        }
      }
    } catch (err) {
      console.error('Camera error', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => stopCamera();
  }, [selectedDeviceId]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // We want a 3:4 portrait aspect ratio
      const targetRatio = 3 / 4;
      let targetWidth, targetHeight;

      if (video.videoWidth / video.videoHeight > targetRatio) {
        targetHeight = video.videoHeight;
        targetWidth = targetHeight * targetRatio;
      } else {
        targetWidth = video.videoWidth;
        targetHeight = targetWidth / targetRatio;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const cropX = (video.videoWidth - targetWidth) / 2;
      const cropY = (video.videoHeight - targetHeight) / 2;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle mirroring
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, cropX, cropY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedPhoto(blob);
            setPhotoPreviewUrl(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    e.target.value = ''; // reset input
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    }
  };

  const savePhoto = async () => {
    if (!capturedPhoto || !currentRecord) return;
    const filename = `${currentRecord.recordId}.jpg`;
    
    try {
      await savePhotoToDirectory(directoryHandle, filename, capturedPhoto);
      updateRecordStatus(currentRecord.recordId, 'captured', filename);
      
      retakePhoto(); // clear preview

      if (mode === 'single') {
        onClose();
      } else {
        // Bulk mode logic: go to next pending
        const nextPending = records.slice(currentIndex + 1).find(r => r.status !== 'captured');
        if (nextPending) {
          setCurrentRecordId(nextPending.recordId);
        } else {
          // Finished
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save photo.');
    }
  };

  const skipStudent = () => {
    if (!currentRecord) return;
    updateRecordStatus(currentRecord.recordId, 'skipped');
    retakePhoto();
    
    const nextPending = records.slice(currentIndex + 1).find(r => r.status !== 'captured');
    if (nextPending) {
      setCurrentRecordId(nextPending.recordId);
    } else {
      onClose();
    }
  };

  if (!currentRecord) return null;

  return (
    <div className="camera-interface" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="secondary" onClick={onClose} icon={<ArrowLeft size={16} />}>Back</Button>
          <h2 className="h2">{mode === 'bulk' ? 'Bulk Capture' : 'Capture Photo'}</h2>
        </div>
        {mode === 'bulk' && (
          <div className="text-secondary">
            Progress: {currentIndex + 1} / {records.length}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', flex: 1 }}>
        <div className="camera-preview-container" style={{ position: 'relative', backgroundColor: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {error && <div className="text-danger bg-white p-4 rounded" style={{ position: 'absolute', zIndex: 10 }}>{error}</div>}
          
          <div style={{ position: 'relative', aspectRatio: '3/4', height: '100%', maxHeight: '600px', backgroundColor: '#111', overflow: 'hidden' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              style={{ 
                width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
                display: capturedPhoto ? 'none' : 'block'
              }}
            />
            {!capturedPhoto && (
              <div style={{ position: 'absolute', top: '5%', bottom: '5%', left: '15%', right: '15%', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '12px', pointerEvents: 'none' }} />
            )}
            {capturedPhoto && photoPreviewUrl && (
              <img src={photoPreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="student-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px', flex: 1 }}>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Current Student</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div className="text-small text-secondary">Record ID</div>
                <div className="font-medium" style={{ fontSize: '18px' }}>{currentRecord.recordId}</div>
              </div>
              {Object.entries(currentRecord.fields).map(([key, value]) => {
                if (key === currentRecord.recordId) return null; // skip primary key if it's identical
                return (
                  <div key={key}>
                    <div className="text-small text-secondary">{key}</div>
                    <div className="font-medium">{String(value)}</div>
                  </div>
                );
              }).slice(0, 5)} 
            </div>
          </div>

          <div className="camera-controls" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {devices.length > 1 && (
              <select 
                className="input-field" 
                value={selectedDeviceId} 
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                style={{ marginBottom: '8px' }}
              >
                {devices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}

            {!capturedPhoto ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button onClick={capturePhoto} size="lg" icon={<Camera size={20} />} style={{ justifyContent: 'center', padding: '16px' }}>
                  Capture Photo
                </Button>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    id="camera-upload-input"
                    accept="image/jpeg, image/png, image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="secondary" 
                    icon={<Upload size={18} />} 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => document.getElementById('camera-upload-input')?.click()}
                  >
                    Upload from Local
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button onClick={savePhoto} size="lg" variant="primary" icon={<Save size={20} />} style={{ justifyContent: 'center', padding: '16px' }}>
                  Save &amp; Continue
                </Button>
                <Button onClick={retakePhoto} variant="secondary" icon={<RefreshCcw size={18} />} style={{ justifyContent: 'center' }}>
                  Retake
                </Button>
              </>
            )}

            {mode === 'bulk' && !capturedPhoto && (
              <Button onClick={skipStudent} variant="secondary" icon={<SkipForward size={18} />} style={{ justifyContent: 'center', marginTop: '12px' }}>
                Skip Student
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
