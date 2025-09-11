import React from 'react';
import './Taskbar.css';
import { getAppIcon } from '../utils/appIcons.jsx';

const Taskbar = ({ openWindows, onTaskbarClick }) => {
  const pinnedApps = ['FilesApp', 'TerminalApp'];

  // Determine which apps are currently running (open or minimized)
  const runningApps = openWindows.map(win => win.app);
  const runningAppSet = new Set(runningApps);

  // Determine which apps have at least one visible (not minimized) window
  const visibleAppSet = new Set(
    openWindows.filter(win => !win.isMinimized).map(win => win.app)
  );

  // Combine pinned and running apps, ensuring no duplicates
  const taskbarApps = [...new Set([...pinnedApps, ...runningApps])];

  return (
    <div className="taskbar">
      {taskbarApps.map(appId => (
        <div
          key={appId}
          className={`taskbar-item ${runningAppSet.has(appId) ? 'active' : ''}`}
          onClick={() => onTaskbarClick(appId)}
          title={appId.replace('App', '')}
        >
          <span>
            {getAppIcon(appId, visibleAppSet.has(appId) ? 'open' : 'default')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Taskbar;