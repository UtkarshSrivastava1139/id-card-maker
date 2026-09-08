
import { Type, Image, QrCode, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useTemplateStore } from '../../store/templateStore';
import { useDatasetStore } from '../../store/datasetStore';
import { TemplateRegistry } from '../../templates/registry';
import type { CardDesignTemplate } from '../../types/cardTemplate';

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function Toolbar() {
  const { addElement, elements, guidelines, backgroundImage, zoom, setZoom, loadTemplate } = useTemplateStore();
  const { dataset } = useDatasetStore();
  
  const cardTemplates = TemplateRegistry.getCardDesigns();

  const handleAddText = () => {
    const firstHeader = dataset && dataset.headers.length > 0 ? dataset.headers[0] : 'Text';
    addElement({
      id: generateId(),
      type: 'text',
      x: 10, y: 10, width: 40, height: 10, zIndex: elements.length + 1,
      content: `{{${firstHeader}}}`,
      fontFamily: 'Inter', fontSize: 12, color: '#000000', align: 'left', weight: 'normal'
    });
  };

  const handleAddPhoto = () => {
    addElement({
      id: generateId(),
      type: 'photo',
      x: 10, y: 30, width: 30, height: 40, zIndex: elements.length + 1,
      borderRadius: 0, borderColor: '#cccccc', borderWidth: 0
    });
  };

  const handleAddQRCode = () => {
    addElement({
      id: generateId(),
      type: 'qrcode',
      x: 10, y: 80, width: 20, height: 20, zIndex: elements.length + 1,
      content: '{{Student ID}}'
    });
  };

  const handleExportJSON = () => {
    const exportData: CardDesignTemplate = {
      id: crypto.randomUUID(),
      name: 'Custom Card Design',
      version: 1,
      type: 'card-design',
      isReadonly: true, // Will be readonly when added to Git
      backgroundImage,
      elements,
      guidelines,
      width: 54, // Hardcoding standard size for now, as MVP doesn't have variable card canvas size yet
      height: 85.6
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-design.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="toolbar">
      <h4 className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>Templates</h4>
      <div className="toolbar-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <select 
          className="input-field" 
          onChange={(e) => {
            const template = TemplateRegistry.getCardDesignById(e.target.value);
            if (template) loadTemplate(template);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select Built-in Template</option>
          {cardTemplates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        
        <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} style={{ justifyContent: 'center', width: '100%', marginTop: '4px' }}>
          <Download size={14} style={{ marginRight: '6px' }} /> Export to JSON
        </button>
      </div>

      <h4 className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>Add Elements</h4>
      <div className="toolbar-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleAddText} disabled={!backgroundImage} style={{ justifyContent: 'flex-start', width: '100%' }}>
          <Type size={16} style={{ marginRight: '8px' }} /> Text Field
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleAddPhoto} disabled={!backgroundImage} style={{ justifyContent: 'flex-start', width: '100%' }}>
          <Image size={16} style={{ marginRight: '8px' }} /> Photo Box
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleAddQRCode} disabled={!backgroundImage} style={{ justifyContent: 'flex-start', width: '100%' }}>
          <QrCode size={16} style={{ marginRight: '8px' }} /> QR Code
        </button>
      </div>

      <h4 className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>View</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="btn-icon" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <span className="text-small" style={{ minWidth: '40px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button className="btn-icon" onClick={() => setZoom(Math.min(3.0, zoom + 0.25))} title="Zoom In">
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}
