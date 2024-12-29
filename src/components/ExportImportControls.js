import React, { useRef } from 'react';
import { formatGridDataForExport, parseImportedData } from '../utils/dataFormat';

function ExportImportControls({ years, gridsData, onImport }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const exportData = formatGridDataForExport(years, gridsData);
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Prompt for filename
    const filename = prompt(
      'Enter a name for your file:',
      'gitbrush.json'
    );
    
    if (!filename) return;

    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

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