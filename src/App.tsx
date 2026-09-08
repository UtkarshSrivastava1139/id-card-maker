import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/project/Dashboard';
import ProjectEditor from './components/project/ProjectEditor';
import CaptureView from './components/capture/CaptureView';
import { useProjectStore } from './store/projectStore';

function App() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const [activeModule, setActiveModule] = useState<'id-card' | 'capture'>('id-card');

  return (
    <MainLayout activeModule={activeModule} setActiveModule={setActiveModule}>
      {activeModule === 'capture' ? (
        <CaptureView onShiftToIdCard={() => setActiveModule('id-card')} />
      ) : (
        currentProject ? <ProjectEditor /> : <Dashboard />
      )}
    </MainLayout>
  );
}

export default App;
