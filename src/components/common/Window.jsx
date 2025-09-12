import React, { useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useDisturbances } from '../../contexts/DisturbanceContext';
import { getAppIcon } from '../../utils/appIcons.jsx';
import './Window.css';

const Window = ({
  title,
  id,
  appId,
  children,
  onClose,
  onMinimize,
  onFocus,
  isMinimized,
  zIndex,
  defaultPosition,
  isResizable = true,
  defaultSize,
}) => {
  const nodeRef = useRef(null);
  const { addDisturbance, removeDisturbance, updateDisturbance } = useDisturbances();
  const disturbanceId = `window-${id}`;

  // Register and unregister the window as a disturbance
  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      addDisturbance(disturbanceId, {
        id: disturbanceId,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }

    return () => {
      removeDisturbance(disturbanceId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for handling resize observation, ensuring the observer is managed correctly.
  useEffect(() => {
    const observer = new ResizeObserver(handleDragOrResize);
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    return () => observer.disconnect(); // Cleanup the observer
  }, [id]); // Re-create if the ID changes (which it won't for a given window)

  const handleDragOrResize = () => {
    if (nodeRef.current) {
      const { x, y, width, height } = nodeRef.current.getBoundingClientRect();
      updateDisturbance(disturbanceId, { id: disturbanceId, x, y, width, height });
    }
  };
  
  const containerClassName = `window-container ${isMinimized ? 'minimized' : ''}`;

  const windowStyle = {
    zIndex,
    width: defaultSize?.width ? `${defaultSize.width}px` : undefined,
    height: defaultSize?.height ? `${defaultSize.height}px` : undefined,
    // Conditionally disable the CSS 'resize' property
    resize: isResizable ? 'both' : 'none',
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-title-bar"
      defaultPosition={defaultPosition}
      bounds="parent" // Restrict dragging to the parent container (.App)
      onStart={onFocus} // Bring to front on drag start
      onDrag={handleDragOrResize}
      onStop={handleDragOrResize}
    >
      <div
        className={containerClassName}
        ref={nodeRef}
        style={windowStyle}
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