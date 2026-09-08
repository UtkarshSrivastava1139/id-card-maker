
import { Home, Folder, LayoutTemplate, Settings } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export default function Sidebar() {
  // useProjectStore is not used to read currentProject here

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>ID Card Studio</h2>
      </div>
      
      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <Home size={18} />
          <span>Dashboard</span>
        </a>
        
        <div className="nav-section">
          <h3 className="nav-section-title">Projects</h3>
          <a href="#" className="nav-item">
            <Folder size={18} />
            <span>All Projects</span>
          </a>
        </div>
        
        <a href="#" className="nav-item">
          <LayoutTemplate size={18} />
          <span>Templates</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
}
