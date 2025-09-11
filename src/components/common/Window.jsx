import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import './Window.css';

const Window = ({ title, children, onClose }) => {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-title-bar"
      bounds="parent" // Restrict dragging to the parent container (.desktop)
    >
      <div className="window-container" ref={nodeRef}>
        <div className="window-title-bar">
          <span className="window-title">{title}</span>
          <button className="window-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="window-content">{children}</div>
      </div>
    </Draggable>
  );
};

export default Window;