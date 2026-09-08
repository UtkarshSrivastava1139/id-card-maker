import { useState } from 'react';
import { useCaptureStore } from '../../store/captureStore';
import Button from '../ui/Button';
import { Camera, Play, Download, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CaptureDashboardProps {
  onStartSingleCapture: (recordId: string) => void;
  onStartBulkCapture: () => void;
  onExport: (mode: 'all' | 'completed') => void;
}

export default function CaptureDashboard({ onStartSingleCapture, onStartBulkCapture, onExport }: CaptureDashboardProps) {
  const { dataset, records, directoryHandle, setDirectoryHandle } = useCaptureStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'captured' | 'skipped'>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleSelectFolder = async () => {
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirectoryHandle(dirHandle);
    } catch (err) {
      console.error(err);
    }
  };

  const capturedCount = records.filter(r => r.status === 'captured').length;
  const skippedCount = records.filter(r => r.status === 'skipped').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;

  const filteredRecords = records.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return r.recordId.toLowerCase().includes(searchLower) || 
             Object.values(r.fields).some(v => String(v).toLowerCase().includes(searchLower));
    }
    return true;
  });

  return (
    <div className="capture-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* Top Header & Folder Selection */}
      <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2" style={{ marginBottom: '8px' }}>Photo Capture Dashboard</h2>
          <p className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Saving photos to: <strong>{directoryHandle?.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleSelectFolder}>
            Change Folder
          </Button>
          <Button variant="primary" onClick={() => setShowExportModal(true)} icon={<Download size={16} />}>
            Export Dataset
          </Button>
        </div>
      </div>

      {/* Progress Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div className="text-small text-secondary" style={{ marginBottom: '4px' }}>Total Students</div>
          <div className="h1">{records.length}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div className="text-small text-secondary" style={{ marginBottom: '4px' }}>Captured</div>
          <div className="h1" style={{ color: 'var(--success)' }}>{capturedCount}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div className="text-small text-secondary" style={{ marginBottom: '4px' }}>Pending</div>
          <div className="h1" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div className="text-small text-secondary" style={{ marginBottom: '4px' }}>Skipped</div>
          <div className="h1" style={{ color: 'var(--danger)' }}>{skippedCount}</div>
        </div>
      </div>

      {/* List Header & Bulk Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="search-box" style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
          <select 
            className="input-field" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ width: '150px' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="captured">Captured</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
        
        <Button 
          variant="primary" 
          icon={<Play size={16} />} 
          onClick={onStartBulkCapture}
          disabled={pendingCount === 0}
        >
          Start Bulk Capture
        </Button>
      </div>

      {/* Records Table */}
      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Record ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Preview</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
                <tr key={r.recordId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.recordId}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {Object.values(r.fields).slice(0, 3).join(' • ')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {r.status === 'captured' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '13px', fontWeight: 500 }}><CheckCircle size={14} /> Captured</span>}
                    {r.status === 'pending' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: '13px', fontWeight: 500 }}><Clock size={14} /> Pending</span>}
                    {r.status === 'skipped' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}><XCircle size={14} /> Skipped</span>}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onStartSingleCapture(r.recordId)}
                      icon={<Camera size={14} />}
                    >
                      {r.status === 'captured' ? 'Retake' : 'Capture'}
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '24px', width: '400px', backgroundColor: 'var(--bg-card)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Export Dataset</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Choose how you want to export your student dataset:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                variant="primary" 
                onClick={() => { onExport('completed'); setShowExportModal(false); }}
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                Only Completed Photos
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => { onExport('all'); setShowExportModal(false); }}
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                All Students (Include Status Column)
              </Button>
              <Button 
                onClick={() => setShowExportModal(false)}
                style={{ justifyContent: 'center', marginTop: '8px', border: 'none', backgroundColor: 'transparent' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
