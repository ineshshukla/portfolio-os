import React from 'react';
import TerminalTwoToneIcon from '@mui/icons-material/TerminalTwoTone';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import FolderOpenTwoToneIcon from '@mui/icons-material/FolderOpenTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';

// Mapping from app ID to its icons
export const appIcons = {
  FilesApp: {
    default: <FolderTwoToneIcon className="terminal-icon-large icon-folder" />,
    open: <FolderOpenTwoToneIcon className="terminal-icon-large icon-folder" />,
  },
  TerminalApp: {
    default: <TerminalTwoToneIcon className="terminal-icon-large icon-terminal" />,
    open: <TerminalTwoToneIcon className="terminal-icon-large icon-terminal" />,
  },
  Notepad: {
    default: <DescriptionTwoToneIcon className="terminal-icon-large icon-file-text" />,
    open: <DescriptionTwoToneIcon className="terminal-icon-large icon-file-text" />,
  },
  // Add other apps here
};

/**
 * Gets the icon for a given app.
 * @param {string} appId The ID of the app (e.g., 'FilesApp').
 * @param {'default' | 'open'} state The desired icon state.
 * @returns The icon element or emoji string.
 */
export const getAppIcon = (appId, state = 'default') => {
    const icons = appIcons[appId];
    if (!icons) return '❓'; // Default/unknown icon

    return icons[state] || icons.default;
};