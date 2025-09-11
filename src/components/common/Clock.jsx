import React, { useState, useEffect } from 'react';
import './Clock.css';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  // Options to format the time and date according to typical US locale style
  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const dateOptions = {
    month: 'short',
    day: 'numeric',
  };

  return (
    <div className="taskbar-clock">
      <div className="clock-container">
        <span>{time.toLocaleTimeString(undefined, timeOptions)}</span>
        <span>{time.toLocaleDateString(undefined, dateOptions)}</span>
      </div>
    </div>
  );
};

export default Clock;