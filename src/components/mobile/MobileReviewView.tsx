import { RotateCcw, Check } from 'lucide-react';
import type { MobileSessionRecord } from '../../types/mobile';

interface MobileReviewViewProps {
  photoUrl: string;
  onRetake: () => void;
  onSave: () => void;
  record: MobileSessionRecord;
}

export default function MobileReviewView({ photoUrl, onRetake, onSave, record }: MobileReviewViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#000', color: 'white' }}>
      
      {/* Review Image */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={photoUrl} 
          alt="Captured preview" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Bottom Controls */}
      <div style={{ background: '#1e293b', padding: '24px 16px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        
        {/* Student Info */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{record.displayData.title}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#cbd5e1' }}>Review photo for this student.</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={onRetake} 
            style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RotateCcw size={20} /> Retake
          </button>
          <button 
            onClick={onSave} 
            style={{ flex: 1, padding: '16px', background: 'var(--primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Check size={20} /> Save & Next
          </button>
        </div>

      </div>
    </div>
  );
}
