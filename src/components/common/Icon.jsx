import React from 'react';
import './Icon.css';

const Icon = ({ name, type }) => {
  const getIconEmoji = () => {
    if (type === 'app') return '📁';
    if (type === 'directory') return '📁';
    if (name.endsWith('.md')) return '📝';
    if (name.endsWith('.pdf')) return '📄';
    return '📄';
  };

  return (
    <div className="icon">
      <div className="icon-image">{getIconEmoji()}</div>
      <span className="icon-name">{name}</span>
    </div>
  );
};

export default Icon;

