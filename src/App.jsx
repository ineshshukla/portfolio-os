import React, { useState } from 'react';
import { FileSystemProvider } from './contexts/FileSystemContext';
import Desktop from './components/Desktop';
import Window from './components/common/Window';
import FilesApp from './components/apps/FilesApp';
import './assets/styles/main.css';
import './App.css';

// A simple counter for unique window IDs
let windowIdCounter = 0;

function App() {
  const [openWindows, setOpenWindows] = useState([]);

  const openWindow = (app, props = {}) => {
    // If the app is FilesApp, check if it's already open.
    // If so, don't open a new one. This enforces a single instance.
    if (app === 'FilesApp') {
      const isAlreadyOpen = openWindows.some(win => win.app === 'FilesApp');
      if (isAlreadyOpen) {
        // TODO: In the future, we could bring the existing window to the front.
        return;
      }
    }

    const newWindow = {
      id: windowIdCounter++,
      app,
      title: props.title || app,
      ...props,
    };
    setOpenWindows(currentWindows => [...currentWindows, newWindow]);
  };

  const navigateWindow = (id, newProps) => {
    setOpenWindows(currentWindows =>
      currentWindows.map(win => (win.id === id ? { ...win, ...newProps } : win))
    );
  };

  const closeWindow = id => {
    setOpenWindows(currentWindows => currentWindows.filter(win => win.id !== id));
  };

  const renderApp = win => {
    switch (win.app) {
      case 'FilesApp':
        // Pass the window's ID and the new navigate function
        return <FilesApp id={win.id} path={win.path} onOpen={openWindow} onNavigate={navigateWindow} />;
      // Add other apps here in the future
      default:
        return <div>Unknown App: {win.app}</div>;
    }
  };

  return (
    <FileSystemProvider>
      <div className="App">
        <Desktop onOpen={openWindow} />
        {openWindows.map(win => (
          <Window
            key={win.id}
            title={win.app === 'FilesApp' ? 'Files' : win.title} // Always show 'Files' for FilesApp
            onClose={() => closeWindow(win.id)}
          >
            {renderApp(win)}
          </Window>
        ))}
      </div>
    </FileSystemProvider>
  );
}

export default App;
