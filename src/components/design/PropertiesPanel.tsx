
import { useTemplateStore } from '../../store/templateStore';
import { useDatasetStore } from '../../store/datasetStore';
import { Trash2, Copy, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

export default function PropertiesPanel() {
  const { elements, selectedElementId, updateElement, removeElement, duplicateElement, bringToFront, sendToBack } = useTemplateStore();
  const { dataset } = useDatasetStore();

  const selectedElement = elements.find(el => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="properties-panel empty">
        <p className="text-secondary text-small">Select an element on the canvas to edit its properties.</p>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    updateElement(selectedElement.id, { [field]: value });
  };

  return (
    <div className="properties-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <h4 className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>Properties</h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn-icon" onClick={() => bringToFront(selectedElement.id)} title="Bring to Front">
            <ArrowUpToLine size={16} />
          </button>
          <button className="btn-icon" onClick={() => sendToBack(selectedElement.id)} title="Send to Back">
            <ArrowDownToLine size={16} />
          </button>
          <button className="btn-icon" onClick={() => duplicateElement(selectedElement.id)} title="Duplicate Element">
            <Copy size={16} />
          </button>
          <button className="btn-icon" onClick={() => removeElement(selectedElement.id)} title="Delete Element">
            <Trash2 size={16} color="var(--danger)" />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="form-group">
          <label>X (mm)</label>
          <input type="number" step="0.1" className="input-field" value={Number(selectedElement.x.toFixed(1))} onChange={(e) => handleChange('x', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Y (mm)</label>
          <input type="number" step="0.1" className="input-field" value={Number(selectedElement.y.toFixed(1))} onChange={(e) => handleChange('y', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Width (mm)</label>
          <input type="number" step="0.1" className="input-field" value={Number(selectedElement.width.toFixed(1))} onChange={(e) => handleChange('width', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Height (mm)</label>
          <input type="number" step="0.1" className="input-field" value={Number(selectedElement.height.toFixed(1))} onChange={(e) => handleChange('height', Number(e.target.value))} />
        </div>
      </div>
      
      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label>Rotation (degrees)</label>
        <select className="input-field" value={selectedElement.angle || 0} onChange={(e) => handleChange('angle', Number(e.target.value))}>
          <option value={0}>0°</option>
          <option value={90}>90° (Clockwise)</option>
          <option value={180}>180° (Upside Down)</option>
          <option value={270}>270° (Counter-Clockwise)</option>
        </select>
      </div>

      {selectedElement.type === 'text' && (
        <>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Text Content</label>
            <input type="text" className="input-field" value={(selectedElement as any).content} onChange={(e) => handleChange('content', e.target.value)} />
            {dataset && dataset.headers.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <p className="text-small text-secondary" style={{ marginBottom: '4px' }}>Variables:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {dataset.headers.map(h => (
                    <span 
                      key={h} 
                      className="text-small" 
                      style={{ padding: '2px 6px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }} 
                      onClick={() => handleChange('content', (selectedElement as any).content + `{{${h}}}`)}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Font Family</label>
              <select className="input-field" value={(selectedElement as any).fontFamily || 'Inter'} onChange={(e) => handleChange('fontFamily', e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
            <div className="form-group">
              <label>Font Size (pt)</label>
              <input type="number" className="input-field" value={(selectedElement as any).fontSize} onChange={(e) => handleChange('fontSize', Number(e.target.value))} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Color</label>
              <input type="color" className="input-field" value={(selectedElement as any).color} onChange={(e) => handleChange('color', e.target.value)} style={{ padding: '2px', height: '36px', width: '100%' }} />
            </div>
            <div className="form-group">
              <label>Alignment</label>
              <select className="input-field" value={(selectedElement as any).align} onChange={(e) => handleChange('align', e.target.value)}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="form-group">
              <label>Font Weight</label>
              <select className="input-field" value={(selectedElement as any).weight || 'normal'} onChange={(e) => handleChange('weight', e.target.value)}>
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Line Height</label>
              <input type="number" step="0.1" className="input-field" value={(selectedElement as any).lineHeight || 1.2} onChange={(e) => handleChange('lineHeight', Number(e.target.value))} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '36px' }}>
                <input 
                  type="checkbox" 
                  checked={(selectedElement as any).uppercase || false}
                  onChange={(e) => handleChange('uppercase', e.target.checked)}
                />
                Force Uppercase
              </label>
            </div>
          </div>
        </>
      )}

      {selectedElement.type === 'photo' && (
        <>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Border Radius (mm)</label>
            <input type="number" className="input-field" value={(selectedElement as any).borderRadius} onChange={(e) => handleChange('borderRadius', Number(e.target.value))} />
          </div>
        </>
      )}

      {selectedElement.type === 'qrcode' && (
        <>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>QR Code Data Mapping</label>
            <input type="text" className="input-field" value={(selectedElement as any).content} onChange={(e) => handleChange('content', e.target.value)} />
            <p className="text-small text-secondary" style={{ marginTop: '4px' }}>E.g. https://school.edu/verify/{'{{Student ID}}'}</p>
          </div>
        </>
      )}
    </div>
  );
}
