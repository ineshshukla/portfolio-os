import React from 'react';
import './Icon.css';
import { getAppIcon } from '../../utils/appIcons.jsx';

const Icon = ({ name, type, target }) => {
  const getIconEmoji = () => {
    if (type === 'app') {
      // Use the centralized app icon utility
      return getAppIcon(target);
    }
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
