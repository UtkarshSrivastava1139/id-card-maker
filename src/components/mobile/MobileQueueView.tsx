import { useMobileCaptureStore } from '../../store/mobileCaptureStore';
import { X, CheckCircle, Clock, XCircle } from 'lucide-react';

interface MobileQueueViewProps {
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function MobileQueueView({ currentIndex, onSelect, onClose }: MobileQueueViewProps) {
  const { sessionPayload, records } = useMobileCaptureStore();

  if (!sessionPayload) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'white' }}>Student Queue</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px' }}>
          <X size={24} />
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', padding: '8px 0' }}>
        {records.map((r, i) => {
          const isCurrent = i === currentIndex;
          const sessionRecord = sessionPayload.records.find(sr => sr.recordId === r.recordId);
          
          return (
            <button
              key={r.recordId}
              onClick={() => onSelect(i)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '16px',
                background: isCurrent ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                {r.status === 'captured' && <CheckCircle size={20} color="var(--success)" />}
                {r.status === 'pending' && <Clock size={20} color="var(--warning)" />}
                {r.status === 'skipped' && <XCircle size={20} color="var(--danger)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: isCurrent ? 700 : 500 }}>
                  {sessionRecord?.displayData.title}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  {sessionRecord?.displayData.subtitle}
                </div>
              </div>
              {isCurrent && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '100px' }}>
                  CURRENT
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
