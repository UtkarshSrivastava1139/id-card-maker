import { useState, useEffect } from 'react';
import { useCaptureStore } from '../../store/captureStore';
import { useDatasetStore } from '../../store/datasetStore';
import { usePhotoStore } from '../../store/photoStore';
import { parseDatasetFile } from '../../services/dataset';
import Button from '../ui/Button';
import CaptureDashboard from './CaptureDashboard';
import CameraInterface from './CameraInterface';
import { ArrowRight, Upload } from 'lucide-react';
import Papa from 'papaparse';

interface CaptureViewProps {
  onShiftToIdCard: () => void;
}

export default function CaptureView({ onShiftToIdCard }: CaptureViewProps) {
  const { dataset, initSession, records, directoryHandle, primaryKeyField } = useCaptureStore();
  
  // Local state for setup
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);

  // View state
  const [view, setView] = useState<'dashboard' | 'camera'>('dashboard');
  const [cameraMode, setCameraMode] = useState<'single' | 'bulk'>('single');
  const [cameraTargetId, setCameraTargetId] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    try {
      const data = await parseDatasetFile(file);
      setParsedData(data);
      setHeaders(data.headers);
      setSelectedKey(data.headers[0] || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartSession = () => {
    if (parsedData && selectedKey) {
      initSession(parsedData, selectedKey);
    }
  };

  const exportDataset = (mode: 'all' | 'completed' = 'all') => {
    if (!dataset || !primaryKeyField) return;

    // Build the new dataset by appending the Photo_Filename column
    let newRecords = dataset.records.map(r => {
      const recordId = String(r[primaryKeyField]);
      const captureRec = records.find(c => c.recordId === recordId);
      
      const exportedRow: any = {
        ...r,
        Photo_Filename: captureRec?.photoFilename || ''
      };

      if (mode === 'all') {
        exportedRow['Capture_Status'] = captureRec?.status || 'pending';
      }

      return exportedRow;
    });

    if (mode === 'completed') {
       newRecords = newRecords.filter(r => r.Photo_Filename !== '');
    }

    const fields = [...dataset.headers, 'Photo_Filename'];
    if (mode === 'all') fields.push('Capture_Status');

    const csv = Papa.unparse({
      fields,
      data: newRecords
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `exported_dataset_with_photos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shiftToIdCard = () => {
    // Optionally automatically populate the global stores
    const { setDataset, setPrimaryKeyField } = useDatasetStore.getState();
    const { setDirectoryHandle: setGlobalDir, setMatches } = usePhotoStore.getState();

    if (dataset && selectedKey) {
      setDataset(dataset);
      setPrimaryKeyField(selectedKey);
    }

    if (directoryHandle) {
      // We pass the same directoryHandle to the photoStore
      setGlobalDir(directoryHandle, []); // files array might be empty initially, they'd have to rescan or we map matches directly
      
      // Map existing records to matches automatically based on capture store
      const matches: Record<string, any> = {};
      records.forEach(r => {
        if (r.status === 'captured' && r.photoFilename) {
           // We don't easily have the `File` object here unless we tracked it.
           // ID Card module requires a `File` object for matches.
           // For seamless shift, if they rescan the folder in PhotosView it works,
           // or we can just leave it to them to click "Select Folder" and rescan.
        }
      });
    }

    onShiftToIdCard();
  };

  // Setup Phase State
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const selectedDeviceId = useCaptureStore(state => state.selectedDeviceId);
  const { setSelectedDeviceId, setDirectoryHandle } = useCaptureStore();

  useEffect(() => {
    if (!dataset) {
      navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
        const videoDevices = deviceInfos.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      });
    }
  }, [dataset, selectedDeviceId, setSelectedDeviceId]);

  const handleSelectFolder = async () => {
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirectoryHandle(dirHandle);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Setup Phase
  if (!dataset) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
        <h2 className="h1" style={{ marginBottom: '8px' }}>Photo Capture Studio</h2>
        <p className="body text-secondary" style={{ marginBottom: '32px' }}>
          Complete the 3 steps below to start a new student photo capture session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Dataset */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
              <h3 className="h3">Import Dataset</h3>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Upload Dataset (CSV/XLSX)</label>
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileUpload} 
                className="input-field" 
                style={{ paddingTop: '8px', paddingBottom: '8px' }}
              />
            </div>

            {headers.length > 0 && (
              <div className="form-group">
                <label>Select Primary Key (e.g. Student ID)</label>
                <select className="input-field" value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <p className="text-small text-secondary" style={{ marginTop: '8px' }}>
                  This column will be used to automatically name the captured photographs.
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Folder */}
          <div className="card" style={{ padding: '24px', opacity: parsedData ? 1 : 0.5, pointerEvents: parsedData ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: parsedData ? 'var(--primary)' : 'var(--bg-hover)', color: parsedData ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
              <h3 className="h3">Select Save Folder</h3>
            </div>
            
            <p className="text-secondary text-small" style={{ marginBottom: '16px' }}>Choose the local folder where the photos will be saved.</p>
            <Button variant="secondary" onClick={handleSelectFolder}>
              {directoryHandle ? `Selected: ${directoryHandle.name}` : 'Choose Local Folder...'}
            </Button>
          </div>

          {/* Step 3: Camera */}
          <div className="card" style={{ padding: '24px', opacity: parsedData && directoryHandle ? 1 : 0.5, pointerEvents: parsedData && directoryHandle ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: parsedData && directoryHandle ? 'var(--primary)' : 'var(--bg-hover)', color: parsedData && directoryHandle ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
              <h3 className="h3">Select Camera</h3>
            </div>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Available Webcams</label>
              {devices.length > 0 ? (
                <select 
                  className="input-field" 
                  value={selectedDeviceId || ''} 
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                  {devices.map((d, i) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-secondary text-small">Checking for cameras... (Make sure you have granted permission)</div>
              )}
            </div>

            <Button 
              variant="primary" 
              disabled={!parsedData || !directoryHandle || !selectedDeviceId} 
              onClick={handleStartSession}
              style={{ width: '100%', justifyContent: 'center' }}
              size="lg"
            >
              Start Capture Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Camera Phase
  if (view === 'camera' && cameraTargetId) {
    return (
      <div style={{ padding: '24px', height: '100%' }}>
        <CameraInterface 
          mode={cameraMode} 
          initialRecordId={cameraTargetId} 
          onClose={() => setView('dashboard')} 
        />
      </div>
    );
  }

  // 3. Dashboard Phase
  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button variant="secondary" onClick={shiftToIdCard} icon={<ArrowRight size={16} />}>
          Shift to ID Card Module
        </Button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CaptureDashboard 
          onExport={exportDataset}
          onStartSingleCapture={(id) => {
            setCameraMode('single');
            setCameraTargetId(id);
            setView('camera');
          }}
          onStartBulkCapture={() => {
            const firstPending = records.find(r => r.status === 'pending');
            if (firstPending) {
              setCameraMode('bulk');
              setCameraTargetId(firstPending.recordId);
              setView('camera');
            }
          }}
        />
      </div>
    </div>
  );
}
