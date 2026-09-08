import { useState } from 'react';
import { Plus, Layout } from 'lucide-react';
import Button from '../ui/Button';
import NewProjectModal from './NewProjectModal';
import { useProjectStore } from '../../store/projectStore';
import './Dashboard.css';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const loadProject = useProjectStore((state) => state.loadProject);

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h1 className="h1">Good afternoon</h1>
          <p className="body text-secondary" style={{ marginTop: '4px' }}>
            Create professional ID cards from your data.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Project
        </Button>
      </div>

      <div className="recent-projects">
        <h2 className="h2" style={{ marginBottom: '16px' }}>Recent Projects</h2>
        
        {projects.length === 0 ? (
          <div className="empty-state">
            <Layout size={48} className="empty-icon" />
            <h3 className="h2" style={{ marginTop: '16px' }}>No projects yet</h3>
            <p className="body text-secondary" style={{ marginTop: '8px', marginBottom: '24px' }}>
              Create your first project to get started.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card" onClick={() => loadProject(project.id)}>
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                </div>
                <div className="project-card-body">
                  <div className="card-preview-placeholder">
                    <Layout size={32} color="var(--border-color-focus)" />
                  </div>
                  <div className="project-meta">
                    <span className="text-secondary">{project.cardSize.width} × {project.cardSize.height} mm</span>
                    <span className="text-secondary" style={{ textTransform: 'capitalize' }}>{project.orientation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && <NewProjectModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
