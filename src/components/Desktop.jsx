import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { getAppForFile } from '../utils/fileAssociations';
import Icon from './common/Icon';
import './Desktop.css';

const Desktop = ({ onOpen }) => {
  const fs = useFileSystem();
  // We need state to hold the items so we can trigger a re-render.
  const [desktopItems, setDesktopItems] = useState(() => fs.list('/desktop') || []);

  // Subscribe to file system changes to keep the desktop icons up-to-date.
  useEffect(() => {
    const handleFsUpdate = () => {
      setDesktopItems(fs.list('/desktop') || []);
    };

    // Subscribe and return the unsubscribe function for cleanup.
    const unsubscribe = fs.subscribe(handleFsUpdate);
    return unsubscribe;
  }, [fs]); // Re-subscribe if the fs instance ever changes.

  const handleDoubleClick = (item) => {
    if (item.type === 'directory') {
      onOpen('FilesApp', { path: `/desktop/${item.name}`, title: item.name });
    } else if (item.type === 'app') {
      const appProps = { title: item.name.replace('.app', '') };
      // If it's the Files app, give it a default path to open.
      // The comment was there, but the logic was missing.
      if (item.target === 'FilesApp') {
        appProps.path = '/';
        appProps.title = 'Files'; // Keep window title as "Files"
      }
      onOpen(item.target, appProps);
    } else if (item.type === 'file') {
      const appToOpen = getAppForFile(item.name);
      if (appToOpen) {
        onOpen(appToOpen, { filePath: `/desktop/${item.name}` });
      }
    }
  };

  return (
    <div className="desktop">
      {desktopItems.map(item => (
        <div
          key={item.name}
          className="desktop-item"
          onDoubleClick={() => handleDoubleClick(item)}
        >
          <Icon name={item.name} type={item.type} target={item.target} />
        </div>
      ))}
    </div>
  );
};

export default Desktop;
