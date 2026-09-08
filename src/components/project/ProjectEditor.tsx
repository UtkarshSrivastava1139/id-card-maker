import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import DatasetView from '../dataset/DatasetView';
import PhotosView from '../photos/PhotosView';
import DesignView from '../design/DesignView';
import ValidationView from '../validation/ValidationView';
import GenerationView from '../generation/GenerationView';
import './ProjectEditor.css';

type Tab = 'setup' | 'dataset' | 'photos' | 'design' | 'validation' | 'generation';

export default function ProjectEditor() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const [activeTab, setActiveTab] = useState<Tab>('dataset');

  if (!currentProject) return null;

  return (
    <div className="project-editor">
      <div className="editor-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dataset' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataset')}
        >
          Dataset
        </button>
        <button 
          className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          Photos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Design
        </button>
        <button 
          className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
        <button 
          className={`tab-btn ${activeTab === 'generation' ? 'active' : ''}`}
          onClick={() => setActiveTab('generation')}
        >
          Generate
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'dataset' && <DatasetView />}
        {activeTab === 'photos' && <PhotosView />}
        {activeTab === 'design' && <DesignView />}
        {activeTab === 'validation' && <ValidationView />}
        {activeTab === 'generation' && <GenerationView />}
      </div>
    </div>
  );
}
