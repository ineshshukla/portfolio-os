import React, { useState, useEffect, useRef, createRef } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { useDisturbances } from '../contexts/DisturbanceContext';
import { getAppForFile } from '../utils/fileAssociations';
import Icon from './common/Icon';
import './Desktop.css';

const Desktop = ({ onOpen }) => {
  const fs = useFileSystem();
  const { addDisturbance, removeDisturbance } = useDisturbances();
  const [desktopItems, setDesktopItems] = useState(() => fs.list('/desktop') || []);
  const itemRefs = useRef([]);

  // Subscribe to file system changes to keep the desktop icons up-to-date.
  useEffect(() => {
    const handleFsUpdate = () => {
      setDesktopItems(fs.list('/desktop') || []);
    };

    // Subscribe and return the unsubscribe function for cleanup.
    const unsubscribe = fs.subscribe(handleFsUpdate);
    return unsubscribe;
  }, [fs]); // Re-subscribe if the fs instance ever changes.

  // Manage icon disturbances
  useEffect(() => {
    // Create refs for each item
    itemRefs.current = desktopItems.map((_, i) => itemRefs.current[i] ?? createRef());

    // Add disturbances after a short delay to allow for rendering
    const timer = setTimeout(() => {
      itemRefs.current.forEach((ref, i) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const id = `icon-${desktopItems[i].name}`;
          addDisturbance(id, { id, x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      desktopItems.forEach(item => removeDisturbance(`icon-${item.name}`));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopItems]);

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
      {desktopItems.map((item, index) => (
        <div
          key={item.name}
          ref={itemRefs.current[index]}
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
