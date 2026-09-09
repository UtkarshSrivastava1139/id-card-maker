import { useState } from 'react';
import { useMobileCaptureStore } from '../../store/mobileCaptureStore';
import MobileSetupView from './MobileSetupView';
import MobileCameraView from './MobileCameraView';
import MobileExportView from './MobileExportView';

interface MobileCaptureAppProps {
  sessionId: string;
}

export default function MobileCaptureApp({ sessionId }: MobileCaptureAppProps) {
  const { sessionPayload } = useMobileCaptureStore();
  const [currentView, setCurrentView] = useState<'camera' | 'export'>('camera');

  // Inject mobile specific global styles here or in index.css, 
  // but since we want to keep it simple, inline styling for the root container works.

  if (!sessionPayload || sessionPayload.sessionId !== sessionId) {
    return <MobileSetupView sessionId={sessionId} />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#000', // Mobile apps usually have dark backgrounds for camera
      color: '#fff',
      overflow: 'hidden',
      position: 'fixed',
      inset: 0
    }}>
      {currentView === 'camera' && (
        <MobileCameraView onGoToExport={() => setCurrentView('export')} />
      )}
      {currentView === 'export' && (
        <MobileExportView onGoToCamera={() => setCurrentView('camera')} />
      )}
    </div>
  );
}
