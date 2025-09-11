const fileAssociations = {
  '.md': 'Notepad',
  '.txt': 'Notepad',
};

export const getAppForFile = (filename) => {
  const extension = '.' + filename.split('.').pop();
  return fileAssociations[extension];
};