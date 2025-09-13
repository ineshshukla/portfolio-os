import React from 'react';
import './Bird.css';
import flappy from '../../../assets/flappy.png';

const Bird = ({ size, top, rotation }) => {
  return (
    <div
      className="bird"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(100px, ${top}px) rotate(${rotation}deg)`,
        left: '100px',
        top: 0, // We now control vertical position with transform
      }}
    >
      <img src={flappy} alt="bird" className="bird-sprite" />
    </div>
  );
};

export default Bird;