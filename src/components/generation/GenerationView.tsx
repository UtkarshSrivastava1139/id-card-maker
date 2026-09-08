import { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useDatasetStore } from '../../store/datasetStore';
import { usePhotoStore } from '../../store/photoStore';
import { useTemplateStore } from '../../store/templateStore';
import { useValidationStore } from '../../store/validationStore';
import { useLayoutStore } from '../../store/layoutStore';
import { generateBulk } from '../../services/generator';
import type { GenerationSettings } from '../../services/generator';
import { renderCard } from '../../services/renderer';
import { AlertTriangle, Download, Settings, FileBox, FileText, ChevronLeft, ChevronRight, LayoutGrid, Square, Edit } from 'lucide-react';
import PrintLayoutEditor from '../layout/PrintLayoutEditor';
import './GenerationView.css';

export default function GenerationView() {
  const { currentProject } = useProjectStore();
  const { dataset, primaryKeyField } = useDatasetStore();
  const { matches } = usePhotoStore();
  const { backgroundImage, elements } = useTemplateStore();
  const { report } = useValidationStore();

  const { templates, activeTemplateId, setActiveTemplate } = useLayoutStore();
  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];

  const [settings, setSettings] = useState<GenerationSettings>({
    outputFormat: 'pdf',
    fileFormat: 'png',
    paperSize: 'a4',
    margins: 10, // Obsolete for PDF, kept for backward compat with Zip
    spacing: 5,  // Obsolete for PDF
    addCropMarks: true // Driven by template for PDF
  });

  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'single' | 'page'>('single');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  
  // Initialize selected records with all dataset PKs
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (dataset && primaryKeyField) {
      const allIds = new Set<string>();
      dataset.records.forEach(r => allIds.add(String(r[primaryKeyField] || '')));
      setSelectedRecordIds(allIds);
      setPreviewIndex(0);
      setPreviewPageIndex(0);
    }
  }, [dataset, primaryKeyField]);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function updatePreview() {
      if (!report?.isValid || !dataset || !primaryKeyField || dataset.records.length === 0 || !currentProject) return;
      
      const recordsToPreview = dataset.records.filter(r => selectedRecordIds.has(String(r[primaryKeyField] || '')));
      if (recordsToPreview.length === 0) {
        if (previewCanvasRef.current) {
          const destCtx = previewCanvasRef.current.getContext('2d');
          if (destCtx) destCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
        }
        return;
      }

      if (viewMode === 'single') {
        const record = recordsToPreview[previewIndex] || recordsToPreview[0];
        const pk = primaryKeyField ? String(record[primaryKeyField]) : '';
        const photoFile = matches[pk]?.file || null;
        
        try {
          const canvas = await renderCard({
            record,
            photoFile,
            backgroundImage,
            elements,
            cardConfig: currentProject,
            scale: 0.5 
          });
          
          if (previewCanvasRef.current) {
            const destCtx = previewCanvasRef.current.getContext('2d');
            previewCanvasRef.current.width = canvas.width;
            previewCanvasRef.current.height = canvas.height;
            destCtx?.clearRect(0, 0, canvas.width, canvas.height);
            destCtx?.drawImage(canvas, 0, 0);
          }
        } catch (err) {
          console.error('Preview render failed', err);
        }
      } else {
        // Page Layout Mode from Template
        if (!activeTemplate || activeTemplate.slots.length === 0) return;

        const paperW = activeTemplate.pageWidth;
        const paperH = activeTemplate.pageHeight;
        const cardsPerPage = activeTemplate.slots.length;
        
        const PIXELS_PER_MM = 11.811;
        const SCALE = 0.25; // Smaller scale for full page preview to maintain performance

        const pageCanvas = document.createElement('canvas');
        // If landscape orientation, we might swap dimensions visually, but let's stick to width/height definitions
        pageCanvas.width = (activeTemplate.orientation === 'landscape' ? paperH : paperW) * PIXELS_PER_MM * SCALE;
        pageCanvas.height = (activeTemplate.orientation === 'landscape' ? paperW : paperH) * PIXELS_PER_MM * SCALE;
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) return;

        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        const startIndex = previewPageIndex * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, recordsToPreview.length);

        for (let i = startIndex; i < endIndex; i++) {
          const record = recordsToPreview[i];
          const pk = primaryKeyField ? String(record[primaryKeyField]) : '';
          const photoFile = matches[pk]?.file || null;

          try {
            let cardCanvas = await renderCard({
               record,
               photoFile,
               backgroundImage,
               elements,
               cardConfig: currentProject,
               scale: SCALE
            });

            const indexOnPage = i - startIndex;
            const slot = activeTemplate.slots[indexOnPage];
            
            if (slot.rotation === 90 || slot.rotation === 270) {
              const rotatedCanvas = document.createElement('canvas');
              rotatedCanvas.width = cardCanvas.height;
              rotatedCanvas.height = cardCanvas.width;
              const rctx = rotatedCanvas.getContext('2d')!;
              rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
              rctx.rotate((slot.rotation * Math.PI) / 180);
              rctx.drawImage(cardCanvas, -cardCanvas.width / 2, -cardCanvas.height / 2);
              cardCanvas = rotatedCanvas;
            } else if (slot.rotation === 180) {
              const rotatedCanvas = document.createElement('canvas');
              rotatedCanvas.width = cardCanvas.width;
              rotatedCanvas.height = cardCanvas.height;
              const rctx = rotatedCanvas.getContext('2d')!;
              rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
              rctx.rotate((180 * Math.PI) / 180);
              rctx.drawImage(cardCanvas, -cardCanvas.width / 2, -cardCanvas.height / 2);
              cardCanvas = rotatedCanvas;
            }

            const x = slot.x * PIXELS_PER_MM * SCALE;
            const y = slot.y * PIXELS_PER_MM * SCALE;

            pageCtx.drawImage(cardCanvas, x, y);

            if (activeTemplate.addCropMarks) {
              pageCtx.strokeStyle = '#000000';
              pageCtx.lineWidth = 0.2 * PIXELS_PER_MM * SCALE;
              const l = 3 * PIXELS_PER_MM * SCALE;
              const cx = x;
              const cy = y;
              const cw = slot.width * PIXELS_PER_MM * SCALE;
              const ch = slot.height * PIXELS_PER_MM * SCALE;

              pageCtx.beginPath();
              pageCtx.moveTo(cx, cy - l); pageCtx.lineTo(cx, cy);
              pageCtx.moveTo(cx - l, cy); pageCtx.lineTo(cx, cy);
              pageCtx.moveTo(cx + cw, cy - l); pageCtx.lineTo(cx + cw, cy);
              pageCtx.moveTo(cx + cw + l, cy); pageCtx.lineTo(cx + cw, cy);
              pageCtx.moveTo(cx, cy + ch + l); pageCtx.lineTo(cx, cy + ch);
              pageCtx.moveTo(cx - l, cy + ch); pageCtx.lineTo(cx, cy + ch);
              pageCtx.moveTo(cx + cw, cy + ch + l); pageCtx.lineTo(cx + cw, cy + ch);
              pageCtx.moveTo(cx + cw + l, cy + ch); pageCtx.lineTo(cx + cw, cy + ch);
              pageCtx.stroke();
            }
          } catch (e) {
            console.error('Failed to render card for page view', e);
          }
        }

        if (previewCanvasRef.current) {
          const destCtx = previewCanvasRef.current.getContext('2d');
          previewCanvasRef.current.width = pageCanvas.width;
          previewCanvasRef.current.height = pageCanvas.height;
          destCtx?.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          destCtx?.drawImage(pageCanvas, 0, 0);
        }
      }
    }
    updatePreview();
  }, [report, dataset, primaryKeyField, matches, backgroundImage, elements, currentProject, previewIndex, previewPageIndex, viewMode, settings, selectedRecordIds, activeTemplate]);

  const handleGenerate = async () => {
    if (!dataset || !primaryKeyField || !currentProject) return;
    
    const recordsToGenerate = dataset.records.filter(r => selectedRecordIds.has(String(r[primaryKeyField] || '')));
    
    if (recordsToGenerate.length === 0) {
      setError('Please select at least one record to generate.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress({ current: 0, total: recordsToGenerate.length });

    try {
      await generateBulk(
        recordsToGenerate,
        primaryKeyField,
        matches,
        backgroundImage,
        elements,
        currentProject,
        settings,
        settings.outputFormat === 'pdf' ? activeTemplate : null,
        (current, total) => setProgress({ current, total })
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const recordsToGenerate = dataset && primaryKeyField ? dataset.records.filter(r => selectedRecordIds.has(String(r[primaryKeyField] || ''))) : [];
  const totalCards = recordsToGenerate.length;
  const isAllSelected = dataset ? selectedRecordIds.size === dataset.records.length : false;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRecordIds(new Set());
    } else if (dataset && primaryKeyField) {
      const allIds = new Set<string>();
      dataset.records.forEach(r => allIds.add(String(r[primaryKeyField] || '')));
      setSelectedRecordIds(allIds);
    }
  };

  const toggleRecord = (id: string) => {
    const newSet = new Set(selectedRecordIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRecordIds(newSet);
  };

  let cardsPerPage = 1;
  let layoutError: string | null = null;
  if (currentProject && activeTemplate) {
    cardsPerPage = Math.max(1, activeTemplate.slots.length);
    if (activeTemplate.slots.length === 0) {
      layoutError = 'Selected template has no slots. Please edit the layout.';
    }
  }

  const totalPages = Math.ceil(totalCards / cardsPerPage);

  const goNextPreview = () => {
    if (viewMode === 'single') {
      if (previewIndex < totalCards - 1) setPreviewIndex(p => p + 1);
    } else {
      if (previewPageIndex < totalPages - 1) setPreviewPageIndex(p => p + 1);
    }
  };

  const goPrevPreview = () => {
    if (viewMode === 'single') {
      if (previewIndex > 0) setPreviewIndex(p => p - 1);
    } else {
      if (previewPageIndex > 0) setPreviewPageIndex(p => p - 1);
    }
  };

  if (isEditingLayout) {
    return <PrintLayoutEditor onClose={() => setIsEditingLayout(false)} />;
  }

  return (
    <div className="generation-view">
      <div className="generation-layout">
        <div className="generation-settings">
          <div className="settings-header">
            <Settings size={20} />
            <h3 className="h3">Export Settings</h3>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Output Format</label>
              <div className="format-toggle">
                <button 
                  className={`format-btn ${settings.outputFormat === 'pdf' ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, outputFormat: 'pdf' })}
                >
                  <FileText size={18} />
                  Printable PDF
                </button>
                <button 
                  className={`format-btn ${settings.outputFormat === 'zip' ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, outputFormat: 'zip' })}
                >
                  <FileBox size={18} />
                  Individual ZIP
                </button>
              </div>
            </div>

            {settings.outputFormat === 'zip' && (
              <div className="form-group">
                <label>Image Format</label>
                <select 
                  className="input-field"
                  value={settings.fileFormat}
                  onChange={(e) => setSettings({ ...settings, fileFormat: e.target.value as any })}
                >
                  <option value="png">PNG (Highest Quality)</option>
                  <option value="jpeg">JPEG (Smaller File Size)</option>
                </select>
              </div>
            )}

            {settings.outputFormat === 'pdf' && (
              <div className="form-group" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Print Layout Template
                </label>
                <select 
                  className="input-field"
                  value={activeTemplateId || ''}
                  onChange={(e) => setActiveTemplate(e.target.value)}
                  style={{ marginBottom: '8px' }}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  onClick={() => setIsEditingLayout(true)}
                >
                  <Edit size={16} />
                  Edit Layout
                </button>
              </div>
            )}
          </div>

          <div className="generation-action">
            {error && <div className="generation-error" style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}
            {layoutError && settings.outputFormat === 'pdf' && (
              <div className="generation-error" style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '13px' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                {layoutError} Decrease margins or spacing.
              </div>
            )}
            
            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleGenerate}
              disabled={isGenerating || totalCards === 0 || (settings.outputFormat === 'pdf' && !!layoutError)}
            >
              {isGenerating ? 'Generating...' : (
                <>
                  <Download size={20} />
                  Generate {totalCards} Cards
                </>
              )}
            </button>
            
            {isGenerating && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <span className="progress-text">{progress.current} / {progress.total} Generated</span>
              </div>
            )}
          </div>
        </div>

        <div className="generation-preview" style={{ overflowY: 'auto' }}>
          {!report?.isValid && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', width: '100%' }}>
              <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={18} />
                Validation Warnings
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                There are validation errors (such as missing photos or invalid template variables). You can choose to ignore them and generate anyway, but the output may be incomplete.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
            <h3 className="h3">
              Output Preview
              {viewMode === 'single' ? ` (Record ${totalCards > 0 ? previewIndex + 1 : 0} of ${totalCards})` : ` (Page ${totalPages > 0 ? previewPageIndex + 1 : 0} of ${totalPages})`}
            </h3>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="format-toggle" style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-surface-hover)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                <button 
                  className={`btn-icon ${viewMode === 'single' ? 'active' : ''}`}
                  onClick={() => setViewMode('single')}
                  title="Single Card View"
                  style={{ backgroundColor: viewMode === 'single' ? 'white' : 'transparent', boxShadow: viewMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                  <Square size={16} />
                </button>
                <button 
                  className={`btn-icon ${viewMode === 'page' ? 'active' : ''}`}
                  onClick={() => setViewMode('page')}
                  title="Page Layout View"
                  style={{ backgroundColor: viewMode === 'page' ? 'white' : 'transparent', boxShadow: viewMode === 'page' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px' }} 
                  onClick={goPrevPreview} 
                  disabled={viewMode === 'single' ? previewIndex === 0 : previewPageIndex === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px' }} 
                  onClick={goNextPreview} 
                  disabled={viewMode === 'single' ? previewIndex >= totalCards - 1 : previewPageIndex >= totalPages - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className={`preview-canvas-container ${viewMode === 'page' ? 'page-mode' : ''}`} style={{ marginBottom: '32px', flexShrink: 0 }}>
            <canvas ref={previewCanvasRef} className="preview-canvas" style={{ boxShadow: viewMode === 'page' ? '0 4px 24px rgba(0,0,0,0.1)' : 'none' }} />
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="h3">Select Records to Generate</h3>
              <span className="text-secondary" style={{ fontSize: '13px' }}>{totalCards} selected</span>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-app)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', width: '40px' }}>
                      <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                    </th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>Record ID</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset?.records.map((r, i) => {
                    const pk = primaryKeyField ? String(r[primaryKeyField]) : `row_${i}`;
                    return (
                      <tr key={pk} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedRecordIds.has(pk)} 
                            onChange={() => toggleRecord(pk)}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>{pk}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
