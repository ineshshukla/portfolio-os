import { useContext } from 'react';
import { FileSystemContext } from '../contexts/FileSystemContext';

export const useFileSystem = () => {
  return useContext(FileSystemContext);
};

