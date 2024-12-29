/**
 * Main application component that manages the git contribution graph editor
 * Handles year management, grid data, tool selection, keyboard shortcuts,
 * and import/export functionality
 */
import React, { useState, useEffect } from 'react';
import './App.css';
import YearGridContainer from './components/YearGridContainer';
import YearControls from './components/YearControls';
import useYearList from './hooks/useYearList';
import ExportImportControls from './components/ExportImportControls';
import { initializeYearGrid, formatGridDataForExport } from './utils/dataFormat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TOOLS } from './components/PaintTools';
import { selectionManager } from './utils/selectionManager';
import MobileBlocker from './components/MobileBlocker';

/**
 * Main App component that orchestrates the git contribution graph editor
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  // Year management hooks and state
  const {
    years,
    setYears,
    newYear,
    setNewYear,
    addYear: addYearBase,
    removeYear: removeYearBase
  } = useYearList();

  // Grid data and tool state
  const [gridsData, setGridsData] = useLocalStorage();
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL);
  const [intensity, setIntensity] = useState(1);
  const [hasCopiedData, setHasCopiedData] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Initialize years from stored grid data
  React.useEffect(() => {
    if (Object.keys(gridsData).length > 0) {
      setYears(Object.keys(gridsData).map(Number).sort((a, b) => b - a));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Adds a new year grid to the editor
   */
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

  /**
   * Removes a year grid from the editor
   * @param {number} yearToRemove - Year to remove
   */
  const removeYear = (yearToRemove) => {
    removeYearBase(yearToRemove);
    setGridsData(prev => {
      const newData = { ...prev };
      delete newData[yearToRemove];
      return newData;
    });
  };

  /**
   * Handles importing grid data
   * @param {Object} importedGrids - Grid data to import
   */
  const handleImport = (importedGrids) => {
    setGridsData(importedGrids);
    setYears(Object.keys(importedGrids).map(Number).sort((a, b) => b - a));
  };

  /**
   * Updates the active tool and intensity
   * @param {string} tool - Tool to activate
   * @param {number} newIntensity - New intensity value
   */
  const handleToolChange = React.useCallback((tool, newIntensity) => {
    if (tool) setActiveTool(tool);
    if (newIntensity !== undefined) {
      setIntensity(newIntensity);
    }
  }, [setActiveTool, setIntensity]);

  // Keyboard shortcuts for tools and intensity
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        return;
      }

      if (/^[1-5]$/.test(key)) {
        e.preventDefault();
        const intensity = parseInt(key) - 1;
        handleToolChange(null, intensity);
      }

      switch(key) {
        case 'q':
          handleToolChange(TOOLS.PENCIL);
          break;
        case 'w':
          handleToolChange(TOOLS.FILL);
          break;
        case 'e':
          handleToolChange(TOOLS.RECTANGLE);
          break;
        case 'r':
          handleToolChange(TOOLS.RECTANGLE_BORDER);
          break;
        case 't':
          handleToolChange(TOOLS.SELECT);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToolChange]);

  // Export keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        let filename = prompt('Enter a name for your file:');
        
        if (filename === null) return;
        
        if (!filename.trim()) {
          filename = 'gitbrush';
        }
        
        if (!filename.toLowerCase().endsWith('.json')) {
          filename += '.json';
        }

        const exportData = formatGridDataForExport(years, gridsData);
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

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

  // Selection manager subscription
  useEffect(() => {
    const unsubscribe = selectionManager.subscribeToCopiedData(setHasCopiedData);
    setHasCopiedData(selectionManager.hasCopiedData());
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobileDevice(isMobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div className="App">
      {isMobileDevice ? (
        <MobileBlocker />
      ) : (
        <>
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
                  hasCopiedData={hasCopiedData}
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
              <div className="footer-buttons">
                <a 
                  href={`${process.env.PUBLIC_URL}/downloads/gitbrush.sh`}
                  download="gitbrush.sh"
                  className="download-script-button"
                >
                  <i className="fas fa-download"></i>
                  Download script
                </a>
                <a 
                  href="https://github.com/davidsarratgonzalez/git-brush/blob/main/README.md#how-to-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-repo-button"
                >
                  <i className="fab fa-github"></i>
                  How to use
                </a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
