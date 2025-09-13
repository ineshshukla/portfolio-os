import React from 'react';
import './Pipe.css';

const Pipe = ({ x, topHeight, bottomHeight, width }) => {
  return (
    <>
      {/* Top Pipe */}
      <div
        className="pipe top-pipe"
        style={{
          transform: `translateX(${x}px)`,
          top: 0,
          height: topHeight,
          width: width,
        }}
      >
        <div className="pipe-rim" />
      </div>
      {/* Bottom Pipe */}
      <div
        className="pipe bottom-pipe"
        style={{
          transform: `translateX(${x}px)`,
          bottom: 0,
          height: bottomHeight,
          width: width,
        }}
      >
        <div className="pipe-rim" />
      </div>
    </>
  );
};

export default Pipe;