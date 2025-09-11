import React from 'react';
import TerminalIcon from '@mui/icons-material/Terminal';
import './Icon.css';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';

const getIconForType = (type, name, target, customIcon) => {
  if (customIcon) {
    return customIcon;
  }

  if (type === 'directory') {
    return <FolderIcon className="terminal-icon-large icon-folder" />;
  }

  if (type === 'app') {
    if (target === 'TerminalApp') {
      return <TerminalIcon className="terminal-icon-large icon-terminal" />;
    }
    if (target === 'FilesApp') {
      return <FolderIcon className="terminal-icon-large icon-folder" />;
    }
    if (target === 'Notepad') { // Corrected from NotepadApp to match appIcons.jsx
      return <DescriptionIcon className="terminal-icon-large icon-file-text" />;
    }
    // Default app icon
    return '⚙️';
  }

  // Default file icons based on extension
  if (name.endsWith('.md')) return <DescriptionIcon className="terminal-icon-large icon-file-text" />;
  if (name.endsWith('.txt')) return <ArticleIcon className="terminal-icon-large icon-file-text" />;
  if (name.endsWith('.pdf')) return <PictureAsPdfIcon className="terminal-icon-large icon-file-pdf" />;

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