/**
 * A simple in-memory file system.
 *
 * The structure is a nested object where keys are file/folder names.
 * Each entry has a 'type' ('file' or 'directory') and other metadata.
 * Directories have a 'children' object.
 * Files have 'content'.
 */
const initialFileSystem = {
  type: 'directory',
  name: 'root',
  children: {
    documents: {
      type: 'directory',
      name: 'documents',
      children: {
        'project-docs': {
          type: 'directory',
          name: 'project-docs',
          children: {
            'project1.md': {
              type: 'file',
              name: 'project1.md',
              content: '# Project 1\n\nDetails about my first project.',
            },
            'project2.md': {
              type: 'file',
              name: 'project2.md',
              content: '# Project 2\n\nDetails about my second project.',
            },
          },
        },
      },
    },
    desktop: {
      type: 'directory',
      name: 'desktop',
      children: {
        'about.md': {
          type: 'file',
          name: 'about.md',
          content: '# About Me\n\nThis is a portfolio OS, a fun project to showcase my skills.',
        },
        'resume.pdf': {
          type: 'file',
          name: 'resume.pdf',
          content: 'PDF content would be handled differently, but this is a placeholder.',
        },
        'Files.app': {
          type: 'app',
          name: 'Files Explorer',
          target: 'FilesApp', // This tells our system which app component to launch
          icon: '🗂️',
        },
        'Terminal.app': {
          type: 'app',
          name: 'Terminal',
          target: 'TerminalApp',
        },
        'folder1': {
          type: 'directory',
          name: 'folder1',
          children: {
            'file1.txt': {
              type: 'file',
              name: 'file1.txt',
              content: 'File 1 content',
            },
            'file2.txt': {
              type: 'file',
              name: 'file2.txt',
              content: 'File 2 content',
            },
          },
        }
      },
    },
  },
};

class VirtualFileSystem {
  constructor() {
    this.fs = JSON.parse(JSON.stringify(initialFileSystem)); // Deep copy
    this.subscribers = new Set();
  }

  // --- Subscriber Methods ---
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback); // Return an unsubscribe function
  }

  notify() {
    this.subscribers.forEach(callback => callback());
  }

  // --- Helper Methods ---
  _getEntryByPath(path) {
    const parts = path.split('/').filter(p => p);
    let current = this.fs;

    for (const part of parts) {
      if (current.type !== 'directory' || !current.children[part]) {
        return null; // Path not found
      }
      current = current.children[part];
    }
    return current;
  }

  // --- Public API Methods ---

  /**
   * Lists the contents of a directory.
   * @param {string} path - The path to the directory (e.g., '/desktop').
   * @returns {Array|null} An array of file/directory entries, or null if path is not a directory.
   */
  list(path) {
    const entry = this._getEntryByPath(path);
    if (entry && entry.type === 'directory') {
      return Object.values(entry.children);
    }
    return null;
  }

  /**
   * Gets a single file or directory entry.
   * @param {string} path - The full path to the entry.
   * @returns {object|null} The entry object or null if not found.
   */
  get(path) {
    return this._getEntryByPath(path);
  }

  // --- Placeholder Write Methods (to be implemented in later phases) ---

  createFile(path, content = '') {
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

    const parts = normalizedPath.split('/').filter(p => p);

    if (parts.length === 0) {
      throw new Error('Cannot create file at root.');
    }

    const newFileName = parts.pop();
    const parentPath = parts.length > 0 ? '/' + parts.join('/') : '/';

    const parentEntry = this._getEntryByPath(parentPath);

    if (!parentEntry || parentEntry.type !== 'directory') {
      throw new Error(`cannot create file '${path}': No such file or directory`);
    }

    if (parentEntry.children[newFileName]) {
      // If a file with this name already exists, `touch` does nothing.
      // If a directory with this name exists, we can't create a file with the same name.
      if (parentEntry.children[newFileName].type === 'directory') {
        throw new Error(`cannot create file '${newFileName}': Is a directory`);
      }
      return; // File already exists, do nothing.
    }

    parentEntry.children[newFileName] = { type: 'file', name: newFileName, content };
    this.notify();
  }

  createDirectory(path) {
    // Normalize path by removing trailing slash if it exists, but not for root '/'
    const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

    const parts = normalizedPath.split('/').filter(p => p);

    if (parts.length === 0) {
      throw new Error('Cannot create directory at root.');
    }

    const newDirName = parts.pop();
    const parentPath = parts.length > 0 ? '/' + parts.join('/') : '/';

    const parentEntry = this._getEntryByPath(parentPath);

    if (!parentEntry || parentEntry.type !== 'directory') {
      // Mimic shell error for non-existent parent
      throw new Error(`cannot create directory '${path}': No such file or directory`);
    }

    if (parentEntry.children[newDirName]) {
      // Mimic shell error for existing entry
      throw new Error(`cannot create directory '${newDirName}': File exists`);
    }

    parentEntry.children[newDirName] = {
      type: 'directory',
      name: newDirName,
      children: {},
    };

    this.notify();
  }

  delete(path) {
    console.log(`(FS) Deleting entry at: ${path}`);
    // Logic to delete file/directory will go here
    this.notify();
  }
}

/**
 * To make this singleton HMR-proof in a Vite/React environment,
 * we can attach it to a global object (`window`) during development.
 * This ensures that the same filesystem instance persists across hot reloads,
 * preserving its state.a
 */
let fileSystem;

if (import.meta.env.DEV) {
  if (!window._virtualFileSystem) {
    window._virtualFileSystem = new VirtualFileSystem();
  }
  fileSystem = window._virtualFileSystem;
} else {
  // In production, we create a fresh instance.
  fileSystem = new VirtualFileSystem();
}

export default fileSystem;