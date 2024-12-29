/**
 * ExportImportControls Component
 * 
 * Provides UI controls and functionality for exporting and importing grid data.
 * Handles file operations including JSON export with custom filenames and import validation.
 */

import React, { useRef } from 'react';
import { formatGridDataForExport, parseImportedData } from '../utils/dataFormat';

/**
 * @param {Object} props
 * @param {Array<number>} props.years - Array of years to export
 * @param {Object} props.gridsData - Grid data keyed by year
 * @param {Function} props.onImport - Callback when data is imported
 */
function ExportImportControls({ years, gridsData, onImport }) {
  const fileInputRef = useRef(null);

  /**
   * Handles exporting grid data to a JSON file.
   * Prompts for filename and creates downloadable file.
   */
  const handleExport = () => {
    const exportData = formatGridDataForExport(years, gridsData);
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    let filename = prompt('Enter a name for your file:');
    
    if (filename === null) return;
    
    if (!filename.trim()) {
      filename = 'gitbrush';
    }
    
    if (!filename.toLowerCase().endsWith('.json')) {
      filename += '.json';
    }

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Triggers the hidden file input when Import button is clicked
   */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  /**
   * Handles file selection and import.
   * Validates JSON format and processes imported data.
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const contributions = JSON.parse(evt.target.result);
        const gridData = parseImportedData(contributions);
        if (gridData) {
          onImport(gridData);
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        console.error('Invalid JSON file:', err);
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="export-import-controls">
      <button 
        className="export-button"
        onClick={handleExport}
        title="Export data as JSON"
      >
        <i className="fas fa-download"></i> Export
      </button>
      <button 
        className="import-button"
        onClick={handleImportClick}
        title="Load data from JSON"
      >
        <i className="fas fa-upload"></i> Import
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ExportImportControls;