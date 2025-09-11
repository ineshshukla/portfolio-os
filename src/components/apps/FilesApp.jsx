import React from 'react';
import { useFileSystem } from '../../hooks/useFileSystem';
import Icon from '../common/Icon';
import './FilesApp.css';

const FilesApp = ({ id, path, onOpen, onNavigate }) => {
  const fs = useFileSystem();
  const items = fs.list(path) || [];

  const handleDoubleClick = (item) => {
    const newPath = `${path === '/' ? '' : path}/${item.name}`;
    if (item.type === 'directory') {
      // Instead of opening a new window, navigate the existing one.
      if (onNavigate) {
        onNavigate(id, { path: newPath });
      }
    } else if (item.type === 'app') {
      if (onOpen) {
        onOpen(item.target, { path: '/', title: item.name.replace('.app', '') });
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
      </div>
    </div>
  );
};

export default FilesApp;