import React, { useState } from 'react';
import './App.css';
import YearGridContainer from './components/YearGridContainer';
import YearControls from './components/YearControls';
import useYearList from './hooks/useYearList';
import ExportImportControls from './components/ExportImportControls';
import { initializeYearGrid } from './utils/dataFormat';
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
      // Map keys 1-5 to intensities 0-4
      if (/^[1-5]$/.test(key)) {
        e.preventDefault();
        const intensity = parseInt(key) - 1;
        handleToolChange(null, intensity);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToolChange]);

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
            Made with 💚 by David Sarrat González
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
