import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { getAppForFile } from '../../utils/fileAssociations';
import Icon from '../common/Icon';
import './FilesApp.css';

const FilesApp = ({ id, path, onOpen, onNavigate }) => {
  const fs = useFileSystem();
  // Use state to hold directory items to allow for re-rendering
  const [items, setItems] = useState(() => fs.list(path) || []);

  // Subscribe to file system changes to keep the view up-to-date
  useEffect(() => {
    const handleFsUpdate = () => {
      setItems(fs.list(path) || []);
    };

    handleFsUpdate(); // Initial load and on path change
    const unsubscribe = fs.subscribe(handleFsUpdate);
    return unsubscribe;
  }, [fs, path]); // Re-run if fs instance or path prop changes

  const handleDoubleClick = (item) => {
    const newPath = `${path === '/' ? '' : path}/${item.name}`;
    if (item.type === 'directory') {
      // Instead of opening a new window, navigate the existing one.
      if (onNavigate) {
        onNavigate(id, { path: newPath, title: item.name });
      }
    } else if (item.type === 'app') {
      if (onOpen) {
        onOpen(item.target, { title: item.name.replace('.app', '') });
      }
    } else if (item.type === 'file') {
      const appToOpen = getAppForFile(item.name);
      if (appToOpen && onOpen) {
        onOpen(appToOpen, { filePath: newPath });
      }
    }
  };

  const handlePathClick = newPath => {
    if (!onNavigate) return;
    const newTitle = newPath.split('/').pop() || 'Files';
    onNavigate(id, { path: newPath, title: newTitle });
  };

  const pathSegments = path.split('/').filter(p => p);
  let currentPath = '';

  return (
    <div className="files-app-wrapper">
      <div className="files-app-path-bar">
        <span className="path-segment" onClick={() => handlePathClick('/')}>
          User
        </span>
        {pathSegments.length > 0 && <span className="path-separator">&nbsp;&gt;&gt;&nbsp;</span>}
        {pathSegments.map((segment, index) => {
          currentPath += `/${segment}`;
          const pathToOpen = currentPath; // Capture path for the closure
          const isLast = index === pathSegments.length - 1;
          return (
            <React.Fragment key={segment}>
              <span className={`path-segment ${isLast ? 'active' : ''}`} onClick={() => !isLast && handlePathClick(pathToOpen)}>
                {segment}
              </span>
              {!isLast && <span className="path-separator">&nbsp;&gt;&gt;&nbsp;</span>}
            </React.Fragment>
          );
        })}
      </div>
      <div className="files-app-container">
        {items.map(item => (
          <div key={item.name} className="file-item" onDoubleClick={() => handleDoubleClick(item)}>
            <Icon name={item.name} type={item.type} target={item.target} />
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty-folder-message">This folder is empty.</div>
        )}
      </div>
    </div>
  );
};

export default FilesApp;