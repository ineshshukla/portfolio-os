import React, { createContext, useState, useEffect } from 'react';
import fileSystem from '../api/fileSystem';

export const FileSystemContext = createContext();

export const FileSystemProvider = ({ children }) => {
  // This state is just a counter to force re-renders in consumers.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // When the component mounts, subscribe to the filesystem.
    // The callback simply increments the version, triggering a re-render.
    const unsubscribe = fileSystem.subscribe(() => {
      setVersion(v => v + 1);
    });

    // Unsubscribe on cleanup.
    return () => unsubscribe();
  }, []);

  // The value provided is the filesystem instance itself.
  // The provider re-renders its children whenever 'version' changes.
  return <FileSystemContext.Provider value={fileSystem}>{children}</FileSystemContext.Provider>;
};

