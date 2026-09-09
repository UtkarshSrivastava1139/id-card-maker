import { useState, useEffect } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import type { PrintLayoutTemplate, PrintSlot } from '../../types/layout';
import { ChevronLeft, Plus, Copy, Trash2, Save, Layout, Download } from 'lucide-react';

interface PrintLayoutEditorProps {
  onClose: () => void;
}

export default function PrintLayoutEditor({ onClose }: PrintLayoutEditorProps) {
  const { templates, activeTemplateId, addTemplate, updateTemplate, deleteTemplate, setActiveTemplate } = useLayoutStore();
  const [localTemplate, setLocalTemplate] = useState<PrintLayoutTemplate | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [gridSettings, setGridSettings] = useState({
    cols: 2,
    rows: 5,
    spacingX: 10,
    spacingY: 2,
    slotW: 85.6,
    slotH: 54,
    rotation: 90
  });

  useEffect(() => {
    const active = templates.find(t => t.id === activeTemplateId);
    if (active) {
      setLocalTemplate(JSON.parse(JSON.stringify(active)));
    } else if (templates.length > 0) {
      setLocalTemplate(JSON.parse(JSON.stringify(templates[0])));
      setActiveTemplate(templates[0].id);
    }
  }, [activeTemplateId, templates, setActiveTemplate]);

  if (!localTemplate) return null;

  const isReadonly = localTemplate.isReadonly;

  const handleDuplicateTemplate = () => {
    const newTemplate: PrintLayoutTemplate = {
      ...localTemplate,
      id: crypto.randomUUID(),
      name: `${localTemplate.name} (Copy)`,
      isReadonly: false,
    };
    addTemplate(newTemplate);
    setActiveTemplate(newTemplate.id);
  };

  const handleSave = () => {
    if (isReadonly) return;

    // Bounds checking
    const outOfBounds = localTemplate.slots.some(slot => 
      slot.x < 0 || slot.y < 0 || 
      (slot.x + slot.width) > localTemplate.pageWidth || 
      (slot.y + slot.height) > localTemplate.pageHeight
    );

    if (outOfBounds) {
      alert("Cannot save: One or more slots are outside the page boundaries. Please adjust them to fit inside the page.");
      return;
    }

    updateTemplate(localTemplate.id, localTemplate);
    onClose();
  };

  const handleDeleteTemplate = () => {
    if (isReadonly) return;
    deleteTemplate(localTemplate.id);
    if (templates.length > 0) setActiveTemplate(templates[0].id);
  };

  const handleExportJSON = () => {
    if (!localTemplate) return;
    const exportData = { ...localTemplate };
    // Always export as readonly so when imported to git it behaves properly
    exportData.isReadonly = true;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddSlot = () => {
    if (isReadonly) return;
    const newSlot: PrintSlot = {
      id: crypto.randomUUID(),
      x: 10,
      y: 10,
      width: 85.6,
      height: 54,
      rotation: 90
    };
    setLocalTemplate({ ...localTemplate, slots: [...localTemplate.slots, newSlot] });
    setSelectedSlotId(newSlot.id);
  };

  const handleUpdateSlot = (id: string, updates: Partial<PrintSlot>) => {
    if (isReadonly) return;
    setLocalTemplate({
      ...localTemplate,
      slots: localTemplate.slots.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const handleDeleteSlot = (id: string) => {
    if (isReadonly) return;
    setLocalTemplate({
      ...localTemplate,
      slots: localTemplate.slots.filter(s => s.id !== id)
    });
    if (selectedSlotId === id) setSelectedSlotId(null);
  };

  const handleGenerateGrid = () => {
    if (isReadonly) return;
    const slots: PrintSlot[] = [];
    const { cols, rows, spacingX, spacingY, slotW, slotH, rotation } = gridSettings;
    
    const totalW = cols * slotW + (cols - 1) * spacingX;
    const totalH = rows * slotH + (rows - 1) * spacingY;
    const startX = Math.max(0, (localTemplate.pageWidth - totalW) / 2);
    const startY = Math.max(0, (localTemplate.pageHeight - totalH) / 2);

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        slots.push({
          id: crypto.randomUUID(),
          x: startX + col * (slotW + spacingX),
          y: startY + row * (slotH + spacingY),
          width: slotW,
          height: slotH,
          rotation
        });
      }
    }
    
    setLocalTemplate({ ...localTemplate, slots });
    setSelectedSlotId(null);
  };

  const selectedSlot = localTemplate.slots.find(s => s.id === selectedSlotId);

  // Render logic for the physical canvas
  const PIXELS_PER_MM = 3.78; // Just for visual scaling in the editor
  const canvasW = localTemplate.pageWidth * PIXELS_PER_MM;
  const canvasH = localTemplate.pageHeight * PIXELS_PER_MM;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-icon" onClick={onClose}><ChevronLeft /></button>
          <h2 className="h2" style={{ margin: 0 }}>Print Layout Editor</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExportJSON} title="Export this layout as a JSON file to add to your codebase">
            <Download size={16} /> Export JSON
          </button>
          <button className="btn btn-secondary" onClick={handleDuplicateTemplate}>
            <Copy size={16} /> Duplicate Layout
          </button>
          {!isReadonly && (
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Templates</h3>
            <select 
              className="input-field" 
              value={localTemplate.id}
              onChange={(e) => setActiveTemplate(e.target.value)}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} {t.isReadonly ? '(BUILT-IN)' : ''}</option>
              ))}
            </select>
            {!isReadonly && (
              <button className="btn btn-secondary" style={{ marginTop: '12px', width: '100%', color: 'var(--danger)' }} onClick={handleDeleteTemplate}>
                <Trash2 size={16} /> Delete Custom Template
              </button>
            )}
          </div>
          
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Page Settings</h3>
            
            <div className="form-group">
              <label>Layout Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={localTemplate.name}
                onChange={e => setLocalTemplate({ ...localTemplate, name: e.target.value })}
                disabled={isReadonly}
              />
            </div>

            <div className="form-group form-row">
              <div>
                <label>Page W (mm)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={localTemplate.pageWidth}
                  onChange={e => setLocalTemplate({ ...localTemplate, pageWidth: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
              <div>
                <label>Page H (mm)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={localTemplate.pageHeight}
                  onChange={e => setLocalTemplate({ ...localTemplate, pageHeight: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={localTemplate.addCropMarks}
                  onChange={e => setLocalTemplate({ ...localTemplate, addCropMarks: e.target.checked })}
                  disabled={isReadonly}
                />
                Generate Crop Marks
              </label>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />
            
            <h3 className="h3" style={{ marginBottom: '16px' }}>Auto-Grid Layout</h3>
            
            <div className="form-group form-row">
              <div>
                <label>Columns</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={gridSettings.cols}
                  onChange={e => setGridSettings({ ...gridSettings, cols: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
              <div>
                <label>Rows</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={gridSettings.rows}
                  onChange={e => setGridSettings({ ...gridSettings, rows: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
            </div>

            <div className="form-group form-row">
              <div>
                <label>Spacing X (mm)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={gridSettings.spacingX}
                  onChange={e => setGridSettings({ ...gridSettings, spacingX: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
              <div>
                <label>Spacing Y (mm)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={gridSettings.spacingY}
                  onChange={e => setGridSettings({ ...gridSettings, spacingY: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
            </div>

            <div className="form-group form-row">
              <div>
                <label>Slot W (mm)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={gridSettings.slotW}
                  onChange={e => setGridSettings({ ...gridSettings, slotW: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
              <div>
                <label>Slot H (mm)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={gridSettings.slotH}
                  onChange={e => setGridSettings({ ...gridSettings, slotH: Number(e.target.value) })}
                  disabled={isReadonly}
                />
              </div>
            </div>

            {!isReadonly && (
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '8px' }}
                onClick={handleGenerateGrid}
              >
                <Layout size={16} style={{ marginRight: '8px' }}/>
                Generate Centered Grid
              </button>
            )}
          </div>
        </div>

        {/* Center Canvas */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px', backgroundColor: 'var(--bg-app)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div 
            style={{ 
              width: `${canvasW}px`, 
              height: `${canvasH}px`, 
              backgroundColor: 'white', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              cursor: isReadonly ? 'default' : 'crosshair'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedSlotId(null);
            }}
          >
            {localTemplate.slots.map((slot, i) => (
              <div 
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                style={{
                  position: 'absolute',
                  left: `${slot.x * PIXELS_PER_MM}px`,
                  top: `${slot.y * PIXELS_PER_MM}px`,
                  width: `${slot.width * PIXELS_PER_MM}px`,
                  height: `${slot.height * PIXELS_PER_MM}px`,
                  border: selectedSlotId === slot.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  cursor: isReadonly ? 'default' : 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>Slot {i + 1}</span>
                {slot.rotation !== 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Rot: {slot.rotation}°</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Slot Properties */}
        <div style={{ width: '280px', borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="h3" style={{ margin: 0 }}>Slot Settings</h3>
            {!isReadonly && (
              <button className="btn-icon" onClick={handleAddSlot} title="Add New Slot">
                <Plus size={18} />
              </button>
            )}
          </div>

          {selectedSlot ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group form-row">
                <div>
                  <label>X (mm)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={selectedSlot.x}
                    onChange={e => handleUpdateSlot(selectedSlot.id, { x: Number(e.target.value) })}
                    disabled={isReadonly}
                  />
                </div>
                <div>
                  <label>Y (mm)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={selectedSlot.y}
                    onChange={e => handleUpdateSlot(selectedSlot.id, { y: Number(e.target.value) })}
                    disabled={isReadonly}
                  />
                </div>
              </div>
              
              <div className="form-group form-row">
                <div>
                  <label>Width (mm)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={selectedSlot.width}
                    onChange={e => handleUpdateSlot(selectedSlot.id, { width: Number(e.target.value) })}
                    disabled={isReadonly}
                  />
                </div>
                <div>
                  <label>Height (mm)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={selectedSlot.height}
                    onChange={e => handleUpdateSlot(selectedSlot.id, { height: Number(e.target.value) })}
                    disabled={isReadonly}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rotation (deg)</label>
                <select 
                  className="input-field"
                  value={selectedSlot.rotation}
                  onChange={e => handleUpdateSlot(selectedSlot.id, { rotation: Number(e.target.value) })}
                  disabled={isReadonly}
                >
                  <option value={0}>0° (None)</option>
                  <option value={90}>90° (Clockwise)</option>
                  <option value={180}>180° (Upside down)</option>
                  <option value={270}>270° (Counter-clockwise)</option>
                </select>
              </div>

              {!isReadonly && (
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--danger)', marginTop: '8px' }}
                  onClick={() => handleDeleteSlot(selectedSlot.id)}
                >
                  <Trash2 size={16} /> Delete Slot
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
              <Layout size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Select a slot on the canvas to edit its properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
