import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DisturbanceContext = createContext(null);

export const DisturbanceProvider = ({ children }) => {
  const [disturbances, setDisturbances] = useState({});

  const addDisturbance = useCallback((id, rect) => {
    setDisturbances(prev => ({ ...prev, [id]: rect }));
  }, []);

  const removeDisturbance = useCallback((id) => {
    setDisturbances(prev => {
      const newDisturbances = { ...prev };
      delete newDisturbances[id];
      return newDisturbances;
    });
  }, []);

  // update is the same as add
  const updateDisturbance = addDisturbance;

  const disturbanceArray = useMemo(() => Object.values(disturbances), [disturbances]);

  const value = useMemo(() => ({
    disturbances: disturbanceArray,
    addDisturbance,
    removeDisturbance,
    updateDisturbance,
  }), [disturbanceArray, addDisturbance, removeDisturbance, updateDisturbance]);

  return (
    <DisturbanceContext.Provider value={value}>
      {children}
    </DisturbanceContext.Provider>
  );
};

export const useDisturbances = () => {
  const context = useContext(DisturbanceContext);
  if (!context) {
    throw new Error('useDisturbances must be used within a DisturbanceProvider');
  }
  return context;
};