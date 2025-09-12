/**
 * @file This file defines a mapping of application IDs to their respective icons.
 * @see {@link https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports}
 * @module appIcons
 */
import React from 'react';
import TerminalTwoToneIcon from '@mui/icons-material/TerminalTwoTone';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import FolderOpenTwoToneIcon from '@mui/icons-material/FolderOpenTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import Flappy from '../assets/flappy.png';


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
  FlappyBirdApp: {
    default: <img src={Flappy} alt="Flappy Bird" className="terminal-icon-large icon-flappy" />,
    open: <img src={Flappy} alt="Flappy Bird" className="terminal-icon-large icon-flappy" />,
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