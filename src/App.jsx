import React, { useState, useEffect, useRef } from 'react';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { DisturbanceProvider } from './contexts/DisturbanceContext';
import fileSystem from './api/fileSystem';
import Desktop from './components/Desktop';
import Window from './components/common/Window';
import ParticleBackground from './components/common/ParticleBackground';
import Taskbar from './components/Taskbar';
import FilesApp from './components/apps/FilesApp';
import Notepad from './components/apps/Notepad';
import TerminalApp from './components/apps/TerminalApp';
import './assets/styles/main.css';
import './App.css';

// A simple counter for unique window IDs
let windowIdCounter = 0;
// A counter for z-index
let zIndexCounter = 100; // Start z-index from 100

// Apps that should only have one instance
const singleInstanceApps = new Set(['Notepad', 'TerminalApp', 'FilesApp']);

function App() {
  const [openWindows, setOpenWindows] = useState([]);
  const didBoot = useRef(false);

  // Open the terminal on boot
  useEffect(() => {
    if (!didBoot.current) {
      didBoot.current = true;
      openWindow('TerminalApp', { title: 'Terminal', centered: true });
    }
  }, []); // Empty array ensures this runs only once on mount

  // Helper to get the top-most window
  const getTopWindow = () => {
    if (openWindows.length === 0) return null;
    // Filter out minimized windows from being considered "top" for interaction purposes
    const visibleWindows = openWindows.filter(win => !win.isMinimized);
    if (visibleWindows.length === 0) return null;
    return visibleWindows.reduce((top, win) => (win.zIndex > top.zIndex ? win : top));
  };

  const openWindow = (app, props = {}) => {
    // Handle single-instance apps
    if (singleInstanceApps.has(app)) {
      const existingWindow = openWindows.find(win => win.app === app);
      if (existingWindow) {
        // If opening a file, add it as a tab
        if (props.filePath) {
          updateWindow(existingWindow.id, { newFilePath: props.filePath });
        }
        // Bring to front and un-minimize
        bringToFront(existingWindow.id);
        setOpenWindows(current => current.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false } : w));
        return;
      }
    }
    // If opening a file, prepare the initial state for the Notepad
    let initialProps = { ...props };
    if (app === 'Notepad' && props.filePath) {
      const file = fileSystem.get(props.filePath);
      if (file) {
        initialProps = {
          ...props,
          openFiles: [{ path: props.filePath, title: file.name, content: file.content }],
          activeFileIndex: 0,
        };
      }
    }

    // Estimate window size to keep it from spawning off-screen.
    // Based on .window-container default of 50% width/height.
    const windowWidth = window.innerWidth * 0.5;
    const windowHeight = window.innerHeight * 0.5;

    // Define a smaller region for the random offset, to keep windows spawning centrally.
    const spawnOffset = { x: 150, y: 100 };

    // Calculate the maximum safe coordinates for the top-left corner.
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxX = screenWidth - windowWidth - spawnOffset.x;
    const maxY = screenHeight - windowHeight - spawnOffset.y;
    
    const position = props.centered
      ? { x: (screenWidth - windowWidth) / 2, y: (screenHeight - windowHeight) / 2 }
      : {
          x: Math.max(50, maxX / 2 + Math.random() * spawnOffset.x),
          y: Math.max(50, maxY / 3 + Math.random() * spawnOffset.y),
        };

    const newWindow = {
      id: windowIdCounter++,
      app,
      title: props.title || app,
      position,
      zIndex: zIndexCounter++,
      isMinimized: false,
      ...initialProps,
    };
    setOpenWindows(currentWindows => [...currentWindows, newWindow]);
  };

  const updateWindow = (id, newProps) => {
    setOpenWindows(currentWindows =>
      currentWindows.map(win => {
        if (win.id !== id) return win;

        let updatedWin = { ...win, ...newProps };

        // Logic for adding a new file tab to Notepad
        if (newProps.newFilePath) {
          const { newFilePath, ...rest } = newProps;
          // Check if file is already open
          const existingTabIndex = updatedWin.openFiles.findIndex(f => f.path === newFilePath);
          if (existingTabIndex !== -1) {
            updatedWin.activeFileIndex = existingTabIndex; // Switch to existing tab
          } else {
            const file = fileSystem.get(newFilePath);
            if (file) {
              const newFile = { path: newFilePath, title: file.name, content: file.content };
              updatedWin.openFiles = [...updatedWin.openFiles, newFile];
              updatedWin.activeFileIndex = updatedWin.openFiles.length - 1; // Switch to new tab
            }
          }
          delete updatedWin.newFilePath; // Clean up prop
        }
        return updatedWin;
      })
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
        openWindow('FilesApp', { title: 'Files', path: '/' });
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
        return <FilesApp id={win.id} path={win.path} onOpen={openWindow} onNavigate={updateWindow} />;
      case 'Notepad':
        return (
          <Notepad
            openFiles={win.openFiles}
            activeFileIndex={win.activeFileIndex}
            onTabClick={(index) => updateWindow(win.id, { activeFileIndex: index })}
            onTabClose={(index) => {
              const newFiles = win.openFiles.filter((_, i) => i !== index);
              if (newFiles.length === 0) {
                closeWindow(win.id);
              } else {
                // Adjust active index if necessary
                const newActiveIndex = Math.min(win.activeFileIndex, newFiles.length - 1);
                updateWindow(win.id, { openFiles: newFiles, activeFileIndex: newActiveIndex });
              }
            }}
            onContentChange={(index, newContent) => {
              const newFiles = [...win.openFiles];
              newFiles[index] = { ...newFiles[index], content: newContent };
              // This updates the content in the window's state.
              // A next step would be to persist this back to the virtual file system.
              updateWindow(win.id, { openFiles: newFiles });
            }}
          />
        );
       case 'TerminalApp':
        return <TerminalApp />;
      default:
        return <div>Unknown App: {win.app}</div>;
    }
  };

  return (
    <FileSystemProvider>
      <DisturbanceProvider>
        <div className="App">
          <ParticleBackground />
          <Desktop onOpen={openWindow} />
          <Taskbar openWindows={openWindows} onTaskbarClick={handleTaskbarClick} />
          {openWindows.map((win) => (
            <Window
              key={win.id}
              id={win.id}
              defaultPosition={win.position}
              appId={win.app}
              title={win.title}
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
      </DisturbanceProvider>
    </FileSystemProvider>
  );
}

export default App;
