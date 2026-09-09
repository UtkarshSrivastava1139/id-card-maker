import { useState } from 'react';
import { usePhotoStore } from '../../store/photoStore';
import { useDatasetStore } from '../../store/datasetStore';
import { scanDirectory, matchPhotos } from '../../services/photos';
import { selectLocalFolder } from '../../services/fileSystem';
import Button from '../ui/Button';
import './PhotosView.css';

import { extractPhotosFromZip } from '../../services/mobileImport';

export default function PhotosView() {
  const { dataset, primaryKeyField } = useDatasetStore();
  const { directoryHandle, photoFiles, matchConfig, matches, setDirectoryHandle, setMatchConfig, setMatches, clearPhotos } = usePhotoStore();
  
  const [loading, setLoading] = useState(false);

  const handleSelectFolder = async () => {
    try {
      setLoading(true);
      const { handle, files } = await selectLocalFolder();
      
      let finalFiles = files;
      if (handle) {
        finalFiles = await scanDirectory(handle, matchConfig.recursiveSearch);
      }
      
      const imageFiles = finalFiles.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
      });
      
      const handleToSave = handle || { name: 'Local Folder (Fallback Mode)', fallback: true };
      
      setDirectoryHandle(handleToSave, imageFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const extractedFiles = await extractPhotosFromZip(file);
      
      if (extractedFiles.length === 0) {
        alert("No valid images found in the ZIP.");
        return;
      }
      
      // Store dummy handle for the ZIP import
      const handleToSave = { name: file.name, fallback: true, isZip: true };
      setDirectoryHandle(handleToSave as any, extractedFiles);

    } catch (err) {
      console.error("Failed to extract ZIP:", err);
      alert("Failed to import Mobile ZIP. Please ensure it is a valid ZIP file.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = () => {
    if (!dataset || !primaryKeyField) return;
    const result = matchPhotos(dataset, photoFiles, matchConfig, primaryKeyField);
    setMatches(result);
  };

  if (!dataset || !primaryKeyField) {
    return (
      <div className="empty-state">
        <h3 className="h2">Dataset Required</h3>
        <p className="body text-secondary">Please upload a dataset and select a primary key before connecting photos.</p>
      </div>
    );
  }

  const matchValues = Object.values(matches);
  const matchedCount = matchValues.filter(m => m.file !== null).length;
  const missingCount = matchValues.filter(m => m.file === null).length;
  const totalExpected = dataset.records.length;

  return (
    <div className="photos-view">
      {!directoryHandle ? (
        <div className="empty-state">
          <h3 className="h2">Connect student photos</h3>
          <p className="body text-secondary" style={{ marginTop: '8px', marginBottom: '24px' }}>
            Select a local folder containing your student photos, or import a ZIP from Mobile Capture.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button onClick={handleSelectFolder} disabled={loading}>
              {loading ? 'Scanning folder...' : 'Select Folder'}
            </Button>
            
            <label htmlFor="zip-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
              Import Mobile ZIP
            </label>
            <input 
              id="zip-upload"
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={handleImportZip}
            />
          </div>
        </div>
      ) : (
        <div className="photos-config">
          <div className="photos-header">
            <div>
              <h3 className="h2">Photos Connected</h3>
              <p className="text-secondary">{photoFiles.length} images found</p>
            </div>
            <Button variant="secondary" size="sm" onClick={clearPhotos}>Change Folder</Button>
          </div>

          <div className="config-card">
            <div className="form-group">
              <label>Match photos using dataset column</label>
              <select 
                className="input-field" 
                value={matchConfig.matchField || primaryKeyField} 
                onChange={(e) => setMatchConfig({ ...matchConfig, matchField: e.target.value })}
              >
                {dataset.headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Filename pattern</label>
              <input 
                className="input-field" 
                value={matchConfig.filenamePattern}
                onChange={(e) => setMatchConfig({ ...matchConfig, filenamePattern: e.target.value })}
                placeholder="{{match_field}}"
              />
              <p className="text-small text-secondary">Use {"{{match_field}}"} to substitute the value from the dataset.</p>
            </div>

            <Button onClick={handleMatch} style={{ marginTop: '8px' }}>Run Matching</Button>
          </div>

          {matchValues.length > 0 && (
            <div className="match-results">
              <div className="stats-row">
                <div className="stat-box">
                  <span className="stat-value">{totalExpected}</span>
                  <span className="stat-label">Records</span>
                </div>
                <div className="stat-box success">
                  <span className="stat-value">{matchedCount}</span>
                  <span className="stat-label">Matched</span>
                </div>
                <div className={`stat-box ${missingCount > 0 ? 'warning' : ''}`}>
                  <span className="stat-value">{missingCount}</span>
                  <span className="stat-label">Missing</span>
                </div>
              </div>

              <div className="match-preview-table" style={{ marginTop: '24px' }}>
                <h4 className="h3" style={{ marginBottom: '12px' }}>Match Details</h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-app)', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Record ID</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Photo Match</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Filename</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchValues.map(m => (
                        <tr key={m.recordId} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: m.file ? 'transparent' : 'rgba(239, 68, 68, 0.05)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 500 }}>{m.recordId}</td>
                          <td style={{ padding: '8px 12px' }}>
                            {m.file ? (
                              <img 
                                src={m.objectUrl || ''} 
                                alt={`Photo for ${m.recordId}`} 
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontSize: '10px', textAlign: 'center' }}>
                                Missing
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', color: m.file ? 'inherit' : 'var(--danger)' }}>
                            {m.file ? m.file.name : 'No file matched'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
