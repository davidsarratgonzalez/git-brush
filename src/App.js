import React, { useState } from 'react';
import './App.css';
import YearGridContainer from './components/YearGridContainer';
import YearControls from './components/YearControls';
import useYearList from './hooks/useYearList';
import ExportImportControls from './components/ExportImportControls';
import { initializeYearGrid } from './utils/dataFormat';

function App() {
  const {
    years,
    setYears,
    newYear,
    setNewYear,
    addYear: addYearBase,
    removeYear: removeYearBase
  } = useYearList();

  const [gridsData, setGridsData] = useState({});

  // Wrap addYear to initialize grid data
  const addYear = () => {
    if (!years.includes(newYear)) {
      addYearBase();
      // Initialize empty grid for the new year
      const emptyGrid = initializeYearGrid(newYear);
      setGridsData(prev => ({
        ...prev,
        [newYear]: emptyGrid
      }));
    }
  };

  // Clean up grid data when removing a year
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
