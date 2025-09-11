import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Notepad.css';

const Notepad = ({
  openFiles,
  activeFileIndex,
  onTabClick,
  onTabClose,
  onContentChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const activeFile = openFiles[activeFileIndex];
  const editorRef = useRef(null);

  // Effect to manage state when the active file changes
  useEffect(() => {
    // Always reset to view mode when switching tabs
    setIsEditing(false);

    const isMarkdown = activeFile && activeFile.path.endsWith('.md');

    // For non-markdown files, they are always "editing", so we focus them immediately.
    // We need a timeout because the ref might not be set from the render yet.
    if (!isMarkdown) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          const contentLength = editorRef.current.value.length;
          editorRef.current.setSelectionRange(contentLength, contentLength);
        }
      }, 0);
    }
  }, [activeFile]);

  // Effect to focus the editor when entering edit mode for markdown files
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditing]);

  const handleContentChange = (e) => {
    if (onContentChange) {
      onContentChange(activeFileIndex, e.target.value);
    }
  };

  const renderContent = () => {
    if (!activeFile) {
      return <div className="viewer-placeholder">No file open</div>;
    }

    const isMarkdown = activeFile.path.endsWith('.md');

    if (isMarkdown && !isEditing) {
      // View mode for Markdown files
      return (
        <div className="markdown-content" onClick={() => setIsEditing(true)}>
          <ReactMarkdown>{activeFile.content}</ReactMarkdown>
        </div>
      );
    }

    // Edit mode (for all non-markdown files, or for markdown files when isEditing is true)
    return (
      <textarea
        ref={editorRef}
        className="text-content editor"
        value={activeFile.content}
        onChange={handleContentChange}
        onBlur={() => {
          if (isMarkdown) setIsEditing(false);
        }}
      />
    );
  };

  return (
    <div className="viewer-app-wrapper">
      <div className="viewer-tab-bar">
        {openFiles.map((file, index) => (
          <div
            key={file.path}
            className={`viewer-tab ${index === activeFileIndex ? 'active' : ''}`}
            onClick={() => onTabClick(index)}
          >
            <span>{file.title}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation(); // Prevent tab click when closing
                onTabClose(index);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="viewer-content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default Notepad;