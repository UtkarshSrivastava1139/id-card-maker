import { useState, useEffect } from 'react';
import Peer from 'peerjs';
import { useMobileCaptureStore } from '../../store/mobileCaptureStore';
import type { MobileSessionPayload } from '../../types/mobile';
import { Smartphone, Download, Loader2, AlertCircle } from 'lucide-react';

interface MobileSetupViewProps {
  sessionId: string;
}

export default function MobileSetupView({ sessionId }: MobileSetupViewProps) {
  const { initSession } = useMobileCaptureStore();
  const [status, setStatus] = useState<'connecting' | 'success' | 'error' | 'fallback'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No session ID provided in the URL.');
      return;
    }

    // Connect to the PC via PeerJS
    const peer = new Peer({ debug: 2 });
    
    peer.on('open', () => {
      const conn = peer.connect(sessionId);
      
      conn.on('open', () => {
        console.log("Connected to host");
      });

      conn.on('data', (data) => {
        const payload = data as MobileSessionPayload;
        if (payload && payload.sessionId === sessionId) {
          initSession(payload);
          setStatus('success');
          // Disconnect to operate fully offline
          peer.destroy();
        }
      });

      conn.on('error', () => {
        setStatus('error');
        setErrorMsg('Failed to establish WebRTC connection with PC.');
      });
      
      // If we don't connect within 5 seconds, fallback
      setTimeout(() => {
        const anyPeer = peer as any;
        if (anyPeer.connections && anyPeer.connections[sessionId] && anyPeer.connections[sessionId].length > 0) return;
        setStatus('fallback');
      }, 5000);
    });

    peer.on('error', (err) => {
      console.error(err);
      setStatus('fallback');
    });

    return () => {
      peer.destroy();
    };
  }, [sessionId, initSession]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string) as MobileSessionPayload;
        if (payload.sessionId === sessionId) {
          initSession(payload);
        } else {
          alert("This file is for a different session.");
        }
      } catch (err) {
        alert("Invalid session file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
      backgroundColor: '#f8fafc', color: '#0f172a', padding: '24px', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
    }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
        <Smartphone size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h2 className="h2" style={{ marginBottom: '16px' }}>Mobile Capture Setup</h2>

        {status === 'connecting' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 size={32} className="spin" color="var(--primary)" />
            <p>Syncing session with PC over local network...</p>
          </div>
        )}

        {(status === 'error' || status === 'fallback') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <AlertCircle size={32} color="var(--warning)" />
            <p style={{ fontWeight: 500 }}>Could not connect to PC automatically.</p>
            {errorMsg && <p className="text-small text-danger">{errorMsg}</p>}
            <hr style={{ width: '100%', margin: '16px 0', borderTop: '1px solid var(--border-color)' }} />
            
            <p className="text-small text-secondary" style={{ marginBottom: '16px' }}>
              Please download the <strong>Session Manifest</strong> file on your PC and transfer it to this phone.
            </p>

            <label htmlFor="fallback-upload" className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer', justifyContent: 'center', width: '100%' }}>
              <Download size={16} style={{ marginRight: '8px' }} /> Load Session File
            </label>
            <input 
              id="fallback-upload"
              type="file" 
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        )}

      </div>
    </div>
  );
}
