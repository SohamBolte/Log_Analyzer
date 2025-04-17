import React from 'react';

interface FileSelectorProps {
  files: { filename: string }[];
  selectedFile: string;
  onChange: (filename: string) => void;
}

import axios from 'axios';
import { API_URL } from '../services/api';

export const FileSelector: React.FC<FileSelectorProps> = ({ files, selectedFile, onChange }) => {
  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Delete file ${filename}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_URL}/files/${encodeURIComponent(filename)}`);
      onChange(''); // Reset selection
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  return (
    <>
      <style>{`
        .file-selector-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 24px;
          margin-bottom: 2rem;
        }
        .file-selector-label {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-label);
          margin-right: 1rem;
        }
        .file-selector-controls {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 18px;
        }
        .file-selector-select {
          background: var(--input-bg);
          color: var(--input-text);
          border: 1.5px solid var(--input-border);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          padding: 0 2.5rem 0 1rem;
          height: 48px;
          min-width: 190px;
          box-shadow: 0 2px 8px #0002;
          outline: none;
          appearance: none;
          position: relative;
        }
        .file-selector-select:focus {
          border-color: var(--input-focus);
          box-shadow: 0 0 0 2px #4f8cff88;
        }
        .file-selector-chevron {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          color: var(--input-border);
          pointer-events: none;
          z-index: 2;
        }
        .file-selector-delete {
          display: flex;
          align-items: center;
          background: var(--danger);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0 1.5rem;
          height: 48px;
          font-size: 1rem;
          font-weight: bold;
          box-shadow: 0 2px 8px #0002;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .file-selector-delete:hover {
          background: var(--danger-hover);
        }
        .file-selector-trash {
          margin-right: 0.7rem;
          font-size: 1.35rem;
          display: flex;
          align-items: center;
        }
      `}</style>
      <div className="file-selector-row">
        <label className="file-selector-label">Select File:</label>
        <div className="file-selector-controls">
          <div style={{position: 'relative', width: 190, flexShrink: 0}}>
            <select
              className="file-selector-select"
              value={selectedFile}
              onChange={e => onChange(e.target.value)}
              aria-label="Select log file"
            >
              {files.map(f => (
                <option key={f.filename} value={f.filename}>{f.filename}</option>
              ))}
            </select>
            <span className="file-selector-chevron">▼</span>
          </div>
          <div style={{flex: 1}}></div>
          {selectedFile && (
            <button
              className="file-selector-delete"
              onClick={() => handleDelete(selectedFile)}
              title="Delete selected file"
              aria-label="Delete selected file"
              type="button"
            >
              <span className="file-selector-trash" role="img" aria-label="delete">🗑️</span>
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
};
