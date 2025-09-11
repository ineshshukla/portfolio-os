import React from 'react';
import TerminalTwoToneIcon from '@mui/icons-material/TerminalTwoTone';

// Mapping from app ID to its icons
export const appIcons = {
  FilesApp: {
    default: '🗂️',
    open: '📂',
  },
  TerminalApp: {
    default: <TerminalTwoToneIcon className="terminal-icon-large" />,
    open: <TerminalTwoToneIcon className="terminal-icon-large" />,
  },
  Notepad: {
    default: '📋',
    open: '📋',
  }
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