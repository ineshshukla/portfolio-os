import React from 'react';
import './Bird.css';
import flappy from '../../../assets/flappy.png';

const Bird = ({ size, top }) => {
  return (
    <div
      className="bird"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top: `${top}px`,
        left: '100px',
      }}
    >
      <img src={flappy} alt="bird" className="bird-sprite" />
    </div>
  );
};

export default Bird;