import React, { useState } from 'react';
import './App.css';
import YearGridContainer from './components/YearGridContainer';
import YearControls from './components/YearControls';
import useYearList from './hooks/useYearList';
import ExportImportControls from './components/ExportImportControls';
import { initializeYearGrid, formatGridDataForExport } from './utils/dataFormat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TOOLS } from './components/PaintTools';

function App() {
  const {
    years,
    setYears,
    newYear,
    setNewYear,
    addYear: addYearBase,
    removeYear: removeYearBase
  } = useYearList();

  const [gridsData, setGridsData] = useLocalStorage();
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL);
  const [intensity, setIntensity] = useState(1);

  React.useEffect(() => {
    if (Object.keys(gridsData).length > 0) {
      setYears(Object.keys(gridsData).map(Number).sort((a, b) => b - a));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addYear = () => {
    if (!years.includes(newYear)) {
      addYearBase();
      const emptyGrid = initializeYearGrid(newYear);
      setGridsData(prev => ({
        ...prev,
        [newYear]: emptyGrid
      }));
    }
  };

  const removeYear = (yearToRemove) => {
    removeYearBase(yearToRemove);
    setGridsData(prev => {
      const newData = { ...prev };
      delete newData[yearToRemove];
      return newData;
    });
  };

  const handleImport = (importedGrids) => {
    setGridsData(importedGrids);
    setYears(Object.keys(importedGrids).map(Number).sort((a, b) => b - a));
  };

  // Define handleToolChange first
  const handleToolChange = React.useCallback((tool, newIntensity) => {
    if (tool) setActiveTool(tool);
    if (newIntensity !== undefined) {
      setIntensity(newIntensity);
    }
  }, [setActiveTool, setIntensity]); // Add proper dependencies

  // Then use it in useEffect
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT') return;

      const key = e.key;
      
      // Prevent browser actions for Ctrl+Z and Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        return;
      }

      // Handle number shortcuts for colors
      if (/^[1-5]$/.test(key)) {
        e.preventDefault();
        const intensity = parseInt(key) - 1;
        handleToolChange(null, intensity);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToolChange]);

  // Add export shortcut
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle save shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Prompt for filename, empty default
        let filename = prompt('Enter a name for your file:');
        
        // If user cancels
        if (filename === null) return;
        
        // If empty, use default name
        if (!filename.trim()) {
          filename = 'gitbrush';
        }
        
        // Add .json extension if not present
        if (!filename.toLowerCase().endsWith('.json')) {
          filename += '.json';
        }

        const exportData = formatGridDataForExport(years, gridsData);
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [years, gridsData]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>git brush</h1>
          <YearControls 
            newYear={newYear}
            onYearChange={setNewYear}
            onAddYear={addYear}
          />
          <ExportImportControls
            years={years}
            gridsData={gridsData}
            onImport={handleImport}
          />
        </div>
      </header>
      <main>
        <div className="grids-container">
          {years.map((year) => (
            <YearGridContainer
              key={year}
              year={year}
              onRemove={removeYear}
              gridData={gridsData[year]}
              setGridData={(newData) => {
                setGridsData(prev => ({
                  ...prev,
                  [year]: newData
                }));
              }}
              activeTool={activeTool}
              intensity={intensity}
              onToolChange={handleToolChange}
            />
          ))}
        </div>
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <a 
            href="https://davidsarratgonzalez.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Made with 💚 by <strong>David Sarrat González</strong>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
