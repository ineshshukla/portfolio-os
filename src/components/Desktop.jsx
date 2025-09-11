import React from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import Icon from './common/Icon';
import './Desktop.css';

const Desktop = ({ onOpen }) => {
  const fs = useFileSystem();
  const desktopItems = fs.list('/desktop') || [];

  const handleDoubleClick = (item) => {
    if (item.type === 'directory') {
      onOpen('FilesApp', { path: `/desktop/${item.name}`, title: item.name });
    } else if (item.type === 'app') {
      // Open the app, starting at the root directory.
      onOpen(item.target, { path: '/', title: item.name.replace('.app', '') });
    }
    // In the future, handle file opening here
  };

  return (
    <div className="desktop">
      {desktopItems.map(item => (
        <div
          key={item.name}
          className="desktop-item"
          onDoubleClick={() => handleDoubleClick(item)}
        >
          <Icon name={item.name} type={item.type} />
        </div>
      ))}
    </div>
  );
};

export default Desktop;
