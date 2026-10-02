import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/project/Dashboard';
import ProjectEditor from './components/project/ProjectEditor';
import CaptureView from './components/capture/CaptureView';
import OutpassGenerator from './components/outpass/OutpassGenerator';
import { useProjectStore } from './store/projectStore';
import MobileCaptureApp from './components/mobile/MobileCaptureApp';

export type AppModule = 'id-card' | 'capture' | 'outpass';

function App() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const [activeModule, setActiveModule] = useState<AppModule>('id-card');

  const urlParams = new URLSearchParams(window.location.search);
  const mobileSessionId = urlParams.get('mobile_session');

  if (mobileSessionId) {
    return <MobileCaptureApp sessionId={mobileSessionId} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'capture':
        return <CaptureView onShiftToIdCard={() => setActiveModule('id-card')} />;
      case 'outpass':
        return <OutpassGenerator />;
      default:
        return currentProject ? <ProjectEditor /> : <Dashboard />;
    }
  };

  return (
    <MainLayout activeModule={activeModule} setActiveModule={setActiveModule}>
      {renderModule()}
    </MainLayout>
  );
}

export default App;
