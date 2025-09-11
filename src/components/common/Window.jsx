import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { getAppIcon } from '../../utils/appIcons.jsx';
import './Window.css';

const Window = ({
  title,
  appId,
  children,
  onClose,
  onMinimize,
  onFocus,
  isMinimized,
  zIndex,
  defaultPosition,
}) => {
  const nodeRef = useRef(null);

  const containerClassName = `window-container ${isMinimized ? 'minimized' : ''}`;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-title-bar"
      defaultPosition={defaultPosition}
      bounds="parent" // Restrict dragging to the parent container (.App)
      onStart={onFocus} // Bring to front on drag start
    >
      <div
        className={containerClassName}
        ref={nodeRef}
        style={{ zIndex }}
        onMouseDown={onFocus} // Bring to front on click
      >
        <div className="window-title-bar">
          <div className="window-title-icon">
            {getAppIcon(appId)}
          </div>
          <span className="window-title">{title}</span>
          <div className="window-controls">
            <button className="window-button" onClick={onMinimize}>-</button>
            <button className="window-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="window-content">{children}</div>
      </div>
    </Draggable>
  );
};

export default Window;