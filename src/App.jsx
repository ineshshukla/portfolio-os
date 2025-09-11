import React, { useState } from 'react';
import { FileSystemProvider } from './contexts/FileSystemContext';
import Desktop from './components/Desktop';
import Window from './components/common/Window';
import Taskbar from './components/Taskbar';
import FilesApp from './components/apps/FilesApp';
import './assets/styles/main.css';
import './App.css';

// A simple counter for unique window IDs
let windowIdCounter = 0;
// A counter for z-index
let zIndexCounter = 100; // Start z-index from 100

function App() {
  const [openWindows, setOpenWindows] = useState([]);

  // Helper to get the top-most window
  const getTopWindow = () => {
    if (openWindows.length === 0) return null;
    // Filter out minimized windows from being considered "top" for interaction purposes
    const visibleWindows = openWindows.filter(win => !win.isMinimized);
    if (visibleWindows.length === 0) return null;
    return visibleWindows.reduce((top, win) => (win.zIndex > top.zIndex ? win : top));
  };

  const openWindow = (app, props = {}) => {
    // Check if a window for this app is already open
    const existingWindow = openWindows.find(win => win.app === app);
    if (existingWindow) {
      // It's open, so focus/unminimize it.
      handleTaskbarClick(app);
      return;
    }

    // Estimate window size to keep it from spawning off-screen.
    // Based on .window-container default of 50% width/height.
    const windowWidth = window.innerWidth * 0.5;
    const windowHeight = window.innerHeight * 0.5;

    // Define a smaller region for the random offset, to keep windows spawning centrally.
    const spawnOffset = { x: 200, y: 150 };

    // Calculate the maximum safe coordinates for the top-left corner.
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxX = screenWidth - windowWidth - spawnOffset.x;
    const maxY = screenHeight - windowHeight - spawnOffset.y;

    const newWindow = {
      id: windowIdCounter++,
      app,
      title: props.title || app,
      position: {
        x: maxX / 2 + Math.random() * spawnOffset.x,
        y: maxY / 3 + Math.random() * spawnOffset.y, // A bit higher than center
      },
      zIndex: zIndexCounter++,
      isMinimized: false,
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

  const bringToFront = (id) => {
    setOpenWindows(currentWindows => {
      const windowToFront = currentWindows.find(win => win.id === id);
      // If window is already on top, do nothing
      if (windowToFront && windowToFront.zIndex >= zIndexCounter - 1) {
        return currentWindows;
      }
      return currentWindows.map(win =>
        win.id === id ? { ...win, zIndex: zIndexCounter++ } : win
      );
    });
  };

  const minimizeWindow = (id) => {
    setOpenWindows(currentWindows =>
      currentWindows.map(win => {
        if (win.id === id) {
          const isNowMinimized = !win.isMinimized;
          // If we are restoring the window, also bring it to the front
          const newZIndex = !isNowMinimized ? zIndexCounter++ : win.zIndex;
          return { ...win, isMinimized: isNowMinimized, zIndex: newZIndex };
        }
        return win;
      })
    );
  };

  const handleTaskbarClick = (appId) => {
    const windowForApp = openWindows.find(win => win.app === appId);

    if (!windowForApp) {
      // App is not running, open it
      if (appId === 'FilesApp') {
        openWindow('FilesApp', { path: '/', title: 'Files' });
      } else if (appId === 'TerminalApp') {
        openWindow('TerminalApp', { title: 'Terminal' });
      }
    } else {
      // App is running
      const topWindow = getTopWindow();
      if (windowForApp.id === topWindow?.id && !windowForApp.isMinimized) {
        // It's the active window, so minimize it
        minimizeWindow(windowForApp.id);
      } else {
        // It's minimized or in the background, so restore and/or bring to front
        setOpenWindows(currentWindows =>
          currentWindows.map(win =>
            win.id === windowForApp.id
              ? { ...win, isMinimized: false, zIndex: zIndexCounter++ }
              : win
          )
        );
      }
    }
  };

  const renderApp = win => {
    switch (win.app) {
      case 'FilesApp':
        return <FilesApp id={win.id} path={win.path} onOpen={openWindow} onNavigate={navigateWindow} />;
      case 'TerminalApp':
        return <div>Terminal App Placeholder</div>;
      default:
        return <div>Unknown App: {win.app}</div>;
    }
  };

  return (
    <FileSystemProvider>
      <div className="App">
        <Desktop onOpen={openWindow} />
        <Taskbar openWindows={openWindows} onTaskbarClick={handleTaskbarClick} />
        {openWindows.map((win) => (
          <Window
            key={win.id}
            defaultPosition={win.position}
            appId={win.app}
            title={win.app === 'FilesApp' ? 'Files' : win.title} // Always show 'Files' for FilesApp
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onFocus={() => bringToFront(win.id)}
            isMinimized={win.isMinimized}
            zIndex={win.zIndex}
          >
            {renderApp(win)}
          </Window>
        ))}
      </div>
    </FileSystemProvider>
  );
}

export default App;
