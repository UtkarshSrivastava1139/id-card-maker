
import { useProjectStore } from '../../store/projectStore';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

export default function TopBar() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const closeProject = useProjectStore((state) => state.closeProject);

  return (
    <header className="topbar">
      {currentProject ? (
        <>
          <div className="topbar-left">
            <button className="back-btn" onClick={closeProject}>
              <ArrowLeft size={16} />
              <span>Projects</span>
            </button>
            <span className="project-title">{currentProject.name}</span>
          </div>
          <div className="topbar-right">
            <Button variant="secondary" size="sm">Save</Button>
          </div>
        </>
      ) : (
        <>
          <div className="topbar-left">
            <span className="project-title">ID Card Studio</span>
          </div>
        </>
      )}
    </header>
  );
}
