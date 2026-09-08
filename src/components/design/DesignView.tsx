import React from 'react';
import { useTemplateStore } from '../../store/templateStore';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import Canvas from './Canvas';
import './DesignView.css';

export default function DesignView() {
  const { backgroundImage, setBackgroundImage } = useTemplateStore();

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
    }
  };

  return (
    <div className="design-view">
      <div className="design-left-panel">
        <Toolbar />
        <PropertiesPanel />
      </div>
      
      <div className="design-center-panel">
        {!backgroundImage ? (
          <div className="empty-canvas-state">
            <h3 className="h2" style={{ marginBottom: '8px' }}>Upload Background Template</h3>
            <p className="text-secondary" style={{ marginBottom: '16px', textAlign: 'center', maxWidth: '300px' }}>
              Select a PNG or JPG image to serve as the static background for your ID cards.
            </p>
            <label className="btn btn-primary btn-md">
              Browse Image
              <input type="file" accept=".png, .jpg, .jpeg" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
            </label>
          </div>
        ) : (
          <Canvas />
        )}
      </div>
    </div>
  );
}
