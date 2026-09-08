
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/project/Dashboard';
import ProjectEditor from './components/project/ProjectEditor';
import { useProjectStore } from './store/projectStore';

function App() {
  const currentProject = useProjectStore((state) => state.currentProject);

  return (
    <MainLayout>
      {currentProject ? <ProjectEditor /> : <Dashboard />}
    </MainLayout>
  );
}

export default App;
