import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  activeModule: 'id-card' | 'capture';
  setActiveModule: (m: 'id-card' | 'capture') => void;
}

export default function MainLayout({ children, activeModule, setActiveModule }: MainLayoutProps) {
  return (
    <div className="layout-container">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="layout-main">
        <TopBar />
        <main className="layout-content">
          {children}
        </main>
        <footer className="layout-footer">
          Developed by <a href="https://utkarshsrivastava.tech" target="_blank" rel="noopener noreferrer">Utkarsh Srivastava</a> (utkarshsrivastava.tech)
        </footer>
      </div>
    </div>
  );
}
