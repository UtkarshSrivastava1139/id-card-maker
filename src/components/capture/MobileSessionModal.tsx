import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCaptureStore } from '../../store/captureStore';
import { useProjectStore } from '../../store/projectStore';
import { useDatasetStore } from '../../store/datasetStore';
import type { MobileSessionPayload, MobileSessionRecord } from '../../types/mobile';
import Button from '../ui/Button';
import { Smartphone, Download, X, Loader2, CheckCircle2 } from 'lucide-react';
import Peer from 'peerjs';

interface MobileSessionModalProps {
  onClose: () => void;
}

export default function MobileSessionModal({ onClose }: MobileSessionModalProps) {
  const { records } = useCaptureStore();
  const { currentProject } = useProjectStore();
  const { primaryKeyField } = useDatasetStore();
  
  const [sessionId, setSessionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [status, setStatus] = useState<'initializing' | 'waiting' | 'connected' | 'transferred' | 'error'>('initializing');
  const [payload, setPayload] = useState<MobileSessionPayload | null>(null);
  
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    if (!currentProject || !primaryKeyField) return;
    
    const newSessionId = `session-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Construct Payload
    const sessionRecords: MobileSessionRecord[] = records.map((r) => {
      const displayFields = Object.entries(r.fields).filter(([k]) => k !== primaryKeyField);
      
      return {
        recordId: r.recordId,
        displayData: {
          title: r.recordId,
          subtitle: displayFields[0]?.[1] || '',
          details: displayFields.slice(1, 3).map(f => f[1]).join(' • '),
        }
      };
    });

    const newPayload: MobileSessionPayload = {
      sessionId: newSessionId,
      projectName: currentProject.name,
      primaryKeyField: primaryKeyField,
      records: sessionRecords,
    };
    
    setPayload(newPayload);

    // Setup URL
    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}?mobile_session=${newSessionId}`;
    setQrUrl(fullUrl);

    // Initialize PeerJS Host
    const peer = new Peer(newSessionId, { debug: 2 });
    peerRef.current = peer;

    peer.on('open', () => {
      setStatus('waiting');
    });

    peer.on('connection', (conn) => {
      setStatus('connected');
      
      conn.on('open', () => {
        // Send payload as soon as connected
        conn.send(newPayload);
        setStatus('transferred');
        
        // Close connection after short delay
        setTimeout(() => {
          conn.close();
        }, 2000);
      });
    });

    peer.on('error', (err) => {
      console.error("PeerJS Error:", err);
      setStatus('error');
    });

    return () => {
      peer.destroy();
    };
  }, [records, currentProject]);

  const handleDownloadFallback = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile_session_${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '480px', backgroundColor: 'var(--bg-card)', padding: 0, overflow: 'hidden' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} /> Use Mobile Camera
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            Scan the QR code with your phone's camera to open the mobile capture interface and sync the student list.
          </p>

          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {qrUrl ? (
              <QRCodeSVG value={qrUrl} size={200} level="M" includeMargin={false} />
            ) : (
              <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                <Loader2 size={32} className="spin" color="var(--text-secondary)" />
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div style={{ marginBottom: '24px', padding: '12px 24px', borderRadius: '100px', backgroundColor: 'var(--bg-app)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {status === 'initializing' && <><Loader2 size={16} className="spin" /> <span style={{ fontSize: '14px' }}>Initializing Session...</span></>}
            {status === 'waiting' && <><Loader2 size={16} className="spin" color="var(--primary)" /> <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>Waiting for mobile device to scan...</span></>}
            {status === 'connected' && <span style={{ fontSize: '14px', color: 'var(--warning)', fontWeight: 500 }}>Device connected. Transferring...</span>}
            {status === 'transferred' && <><CheckCircle2 size={16} color="var(--success)" /> <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 500 }}>Session Transferred! You can close this.</span></>}
            {status === 'error' && <><X size={16} color="var(--danger)" /> <span style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 500 }}>Network connection error</span></>}
          </div>

          <hr style={{ width: '100%', border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 0 24px 0' }} />

          <div style={{ textAlign: 'left', width: '100%' }}>
            <h4 className="h4" style={{ marginBottom: '8px' }}>Fallback Mode</h4>
            <p className="text-secondary text-small" style={{ marginBottom: '16px' }}>
              If your school network blocks direct connections, download the session file below and send it to your phone (via Email, WhatsApp, or AirDrop). Scan the QR above and use the "Load File" option on your phone.
            </p>
            <Button variant="secondary" onClick={handleDownloadFallback} icon={<Download size={16} />} style={{ width: '100%', justifyContent: 'center' }}>
              Download Session Manifest
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}
