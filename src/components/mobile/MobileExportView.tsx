import { useState } from 'react';
import JSZip from 'jszip';
import { useMobileCaptureStore } from '../../store/mobileCaptureStore';
import { Download, ChevronLeft, Trash2, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';

interface MobileExportViewProps {
  onGoToCamera: () => void;
}

export default function MobileExportView({ onGoToCamera }: MobileExportViewProps) {
  const { records, sessionPayload, clearSession } = useMobileCaptureStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const capturedRecords = records.filter(r => r.status === 'captured' && r.photoBlob && r.photoFilename);
  const skippedRecords = records.filter(r => r.status === 'skipped');
  const pendingRecords = records.filter(r => r.status === 'pending');

  const handleExport = async () => {
    if (capturedRecords.length === 0) {
      alert("No photos to export.");
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      const folder = zip.folder('Mobile_Photos');
      if (!folder) throw new Error("Could not create ZIP folder");

      capturedRecords.forEach(record => {
        if (record.photoBlob && record.photoFilename) {
          folder.file(record.photoFilename, record.photoBlob);
        }
      });

      // Optional manifest for debug/audit, not required for core photo engine import
      if (sessionPayload) {
        folder.file('session-manifest.json', JSON.stringify({
          sessionId: sessionPayload.sessionId,
          projectName: sessionPayload.projectName,
          captured: capturedRecords.length,
          skipped: skippedRecords.length,
          records: records.map(r => ({
            recordId: r.recordId,
            status: r.status,
            photoFilename: r.photoFilename
          }))
        }, null, 2));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionPayload?.projectName || 'Dataset'}_Photos.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      setExportComplete(true);
    } catch (err) {
      console.error(err);
      alert("Failed to export ZIP file.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to exit and clear this session? Any un-exported photos will be permanently lost.")) {
      clearSession();
      window.location.href = window.location.origin + window.location.pathname; // Remove url params
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      
      {/* Header */}
      <div style={{ padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
        <button onClick={onGoToCamera} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={24} /> <span style={{ fontSize: '16px', fontWeight: 500, marginLeft: '8px' }}>Back to Camera</span>
        </button>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <h2 className="h2" style={{ marginBottom: '24px' }}>Session Export</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>{capturedRecords.length}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Captured</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px' }}>{pendingRecords.length}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pending</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <h3 className="h3" style={{ marginBottom: '16px' }}>Export Photos to PC</h3>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            Generate a ZIP file containing all your captured photos. Transfer this ZIP to your PC and use the "Import Mobile ZIP" feature in ID Card Studio.
          </p>
          
          <Button 
            variant="primary" 
            onClick={handleExport} 
            disabled={isExporting || capturedRecords.length === 0}
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}
          >
            {isExporting ? 'Generating ZIP...' : (
              <>
                {exportComplete ? <CheckCircle2 size={20} style={{ marginRight: '8px' }} /> : <Download size={20} style={{ marginRight: '8px' }} />}
                {exportComplete ? 'Export Complete. Export Again?' : 'Download ZIP'}
              </>
            )}
          </Button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <button 
            onClick={handleClear}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}
          >
            <Trash2 size={16} /> Exit & Clear Session
          </button>
        </div>

      </div>

    </div>
  );
}
