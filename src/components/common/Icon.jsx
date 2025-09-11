import React from 'react';
import TerminalIcon from '@mui/icons-material/Terminal';
import './Icon.css';

const getIconForType = (type, name, target, customIcon) => {
  if (customIcon) {
    return customIcon;
  }

  if (type === 'directory') {
    return '📁';
  }

  if (type === 'app') {
    if (target === 'TerminalApp') {
      return <TerminalIcon className="terminal-icon-large" />;
    }
    if (target === 'FilesApp') {
      return '🗂️'; 
    }
    // Default app icon
    return '⚙️';
  }

  // Default file icons based on extension
  if (name.endsWith('.md')) return '📝';
  if (name.endsWith('.txt')) return '📄';
  if (name.endsWith('.pdf')) return '📕';

  return '❓'; // Default for unknown files
};

const Icon = ({ name, type, target, icon }) => {
  return (
    <div className="icon-container">
      <div className="icon-image">{getIconForType(type, name, target, icon)}</div>
      <span className="icon-label">{name.replace(/\.app$/, '')}</span>
    </div>
  );
};

export default Icon;