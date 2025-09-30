import { join, resolve, normalize } from 'path-browserify';

/**
 * Resolves a path relative to the current working directory.
 * Handles absolute paths, relative paths, and '..'.
 * @param {string} path - The path to resolve.
 * @param {string} cwd - The current working directory.
 * @returns {string} The resolved, normalized path.
 */
const resolvePath = (path, cwd) => {
  if (path.startsWith('/')) {
    return normalize(path); // Absolute path
  }
  return resolve(cwd, path);
};

const cd = async (fs, cwd, args) => {
  if (args.length === 0) {
    // 'cd' with no arguments could go to a home directory in the future,
    // but for now we require a path.
    return { output: 'cd: missing operand' };
  }
  const targetPath = resolvePath(args[0], cwd);

  const item = fs.get(targetPath);

  if (!item) {
    return { output: `cd: no such file or directory: ${args[0]}` };
  }

  if (item.type !== 'directory') {
    return { output: `cd: not a directory: ${args[0]}` };
  }

  // Return the new CWD, and no output on success
  return { newCwd: targetPath, output: '' };
};

const ls = async (fs, cwd, args) => {
  const targetPath = args.length > 0 ? resolvePath(args[0], cwd) : cwd;
  const items = fs.list(targetPath);

  if (!items) {
    return { output: `ls: cannot access '${args[0] || targetPath}': No such file or directory` };
  }

  if (items.length === 0) {
    return { output: '' }; // Empty directory, no output
  }

  // Format output to be a simple list
  const output = items.map(item => {
    // Add a slash to directories for clarity, like `ls -F`
    return item.type === 'directory' ? `${item.name}/` : item.name;
  }).join('\n');

  return { output };
};

const mkdir = async (fs, cwd, args) => {
  if (args.length === 0) {
    return { output: 'mkdir: missing operand' };
  }
  const dirName = args[0];
  const newDirPath = resolvePath(dirName, cwd);

  try {
    fs.createDirectory(newDirPath);
    return { output: '' }; // No output on success
  } catch (e) {
    return { output: `mkdir: ${e.message}` };
  }
};

const cat = async (fs, cwd, args) => {
  if (args.length === 0) {
    return { output: 'cat: missing operand' };
  }
  const filePath = resolvePath(args[0], cwd);
  const file = fs.get(filePath);

  if (!file) {
    return { output: `cat: ${args[0]}: No such file or directory` };
  }

  if (file.type !== 'file') {
    return { output: `cat: ${args[0]}: Is a directory` };
  }

  return { output: file.content || '' };
};

const touch = async (fs, cwd, args) => {
  if (args.length === 0) {
    return { output: 'touch: missing file operand' };
  }
  const fileName = args[0];
  const newFilePath = resolvePath(fileName, cwd);

  try {
    fs.createFile(newFilePath);
    return { output: '' }; // No output on success
  } catch (e) {
    return { output: `touch: ${e.message}` };
  }
};

const commands = {
  cd,
  ls,
  mkdir,
  cat,
  touch,
};

export const executeCommand = async (commandString, fs, cwd) => {
  if (!commandString) {
    return { output: '' };
  }
  const [cmd, ...args] = commandString.trim().split(/\s+/);

  if (commands[cmd]) {
    return await commands[cmd](fs, cwd, args);
  }

  return { output: `command not found: ${cmd}` };
};