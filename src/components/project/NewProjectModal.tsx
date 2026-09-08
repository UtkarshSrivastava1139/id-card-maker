import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import Button from '../ui/Button';
import './NewProjectModal.css';

interface NewProjectModalProps {
  onClose: () => void;
}

export default function NewProjectModal({ onClose }: NewProjectModalProps) {
  const createProject = useProjectStore((state) => state.createProject);
  
  const [name, setName] = useState('School ID Cards 2026');
  const [sizeType, setSizeType] = useState<'id1' | 'custom'>('id1');
  const [width, setWidth] = useState('85.60');
  const [height, setHeight] = useState('53.98');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject({
      name,
      cardSize: {
        width: parseFloat(width),
        height: parseFloat(height)
      },
      orientation
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="h2">Create a new project</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-steps">
          <span className="step active">1 Setup</span>
          <span className="step">→ 2 Dataset</span>
          <span className="step">→ 3 Photos</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Project name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label>Card size</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="sizeType" 
                  checked={sizeType === 'id1'} 
                  onChange={() => {
                    setSizeType('id1');
                    setWidth('85.60');
                    setHeight('53.98');
                  }} 
                />
                <div className="radio-content">
                  <span className="radio-title">Standard ID-1</span>
                  <span className="radio-desc">85.60 × 53.98 mm</span>
                </div>
              </label>
              
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="sizeType" 
                  checked={sizeType === 'custom'} 
                  onChange={() => setSizeType('custom')} 
                />
                <div className="radio-content">
                  <span className="radio-title">Custom</span>
                </div>
              </label>
            </div>

            {sizeType === 'custom' && (
              <div className="custom-size-inputs">
                <div className="input-with-unit">
                  <label>Width</label>
                  <div>
                    <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} required />
                    <span>mm</span>
                  </div>
                </div>
                <div className="input-with-unit">
                  <label>Height</label>
                  <div>
                    <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required />
                    <span>mm</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Orientation</label>
            <div className="radio-group row">
              <label className="radio-label compact">
                <input 
                  type="radio" 
                  name="orientation" 
                  checked={orientation === 'landscape'} 
                  onChange={() => setOrientation('landscape')} 
                />
                Landscape
              </label>
              <label className="radio-label compact">
                <input 
                  type="radio" 
                  name="orientation" 
                  checked={orientation === 'portrait'} 
                  onChange={() => setOrientation('portrait')} 
                />
                Portrait
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
