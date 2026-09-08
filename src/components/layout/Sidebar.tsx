import { Home, Folder, LayoutTemplate, Settings, Camera } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

interface SidebarProps {
  activeModule: 'id-card' | 'capture';
  setActiveModule: (m: 'id-card' | 'capture') => void;
}

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const closeProject = useProjectStore((state) => state.closeProject);

  const handleNav = (module: 'id-card' | 'capture') => {
    setActiveModule(module);
    if (module === 'id-card') {
      closeProject(); // Ensure we go back to Dashboard when clicking Home
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>ID Card Studio</h2>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section" style={{ marginTop: '0' }}>
          <h3 className="nav-section-title">Modules</h3>
          <button 
            className={`nav-item ${activeModule === 'id-card' ? 'active' : ''}`}
            onClick={() => handleNav('id-card')}
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <Home size={18} />
            <span>ID Card Generator</span>
          </button>
          
          <button 
            className={`nav-item ${activeModule === 'capture' ? 'active' : ''}`}
            onClick={() => handleNav('capture')}
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <Camera size={18} />
            <span>Photo Capture Studio</span>
          </button>
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">Library</h3>
          <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <Folder size={18} />
            <span>All Projects</span>
          </button>
          <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <LayoutTemplate size={18} />
            <span>Templates</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
