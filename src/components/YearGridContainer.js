import React, { useEffect, useRef, useCallback, useState } from 'react';
import ContributionGrid from './ContributionGrid';
import { TOOLS, COLORS } from './PaintTools';
import * as GridDrawing from '../utils/gridDrawing';
import { useHistory } from '../hooks/useHistory';
import { selectionManager } from '../utils/selectionManager';

const CELL_SIZE = 10;
const CELL_PADDING = 2;
const GRID_COLORS = [
  '#ebedf0', // 0: empty/none
  '#9be9a8', // 1: light
  '#40c463', // 2: medium
  '#30a14e', // 3: dark
  '#216e39'  // 4: darker
];

const YearGridContainer = ({ 
  year, 
  onRemove, 
  gridData, 
  setGridData,
  activeTool,
  intensity,
  onToolChange,
  hasCopiedData
}) => {
  const id = `canvas-${year}`;
  const history = useHistory(gridData);
  const isDrawingRef = useRef(false);
  const startOfActionRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Function to set grid data *without* pushing to history
  const updateGrid = (newData) => {
    setGridData(newData);
  };

  // Push final result to history
  const completeAction = (finalData) => {
    history.push(JSON.parse(JSON.stringify(finalData)));
    setGridData(finalData);
  };

  const handleMouseDown = () => {
    isDrawingRef.current = true;
    // Save a snapshot of the grid at mouse down,
    // so we know exactly the state before the stroke
    startOfActionRef.current = JSON.parse(JSON.stringify(gridData));
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      // Only push once the stroke is done
      completeAction(gridData);
    }
  };

  // Only “updateGrid” if still drawing; otherwise push immediately
  const handleGridChange = (newData) => {
    if (isDrawingRef.current) {
      updateGrid(newData);
    } else {
      completeAction(newData);
    }
  };

  const handleToolChange = (tool, newIntensity) => {
    onToolChange(tool, newIntensity);
  };

  const handleClearCanvas = () => {
    const canvas = document.querySelector(`#canvas-${year}`);
    const ctx = canvas.getContext('2d');
    const newGridData = gridData.map(row => 
      row.map(cell => cell !== null ? 0 : null)
    );
    handleGridChange(newGridData);
    GridDrawing.drawEmptyGrid(ctx, newGridData, CELL_SIZE, CELL_PADDING, GRID_COLORS);
  };

  const handleUndo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      setGridData(previousState);
      const canvas = document.querySelector(`#canvas-${year}`);
      const ctx = canvas.getContext('2d');
      GridDrawing.drawEmptyGrid(ctx, previousState, CELL_SIZE, CELL_PADDING, GRID_COLORS);
    }
  }, [history, setGridData, year]);

  const handleRedo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setGridData(nextState);
      const canvas = document.querySelector(`#canvas-${year}`);
      const ctx = canvas.getContext('2d');
      GridDrawing.drawEmptyGrid(ctx, nextState, CELL_SIZE, CELL_PADDING, GRID_COLORS);
    }
  }, [history, setGridData, year]);

  // Add mouse enter/leave handlers
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Keyboard shortcuts only active when hovered
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isHovered) return;  // Only handle shortcuts when hovered

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, isHovered]);

  return (
    <div 
      className="year-grid"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="grid-controls">
        <div className="year-number">{year}</div>
        <div className="grid-header">
          <div className="paint-tools">
            <div className="tool-buttons">
              <button 
                className={`tool-button ${activeTool === TOOLS.PENCIL ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.PENCIL)}
                title="Pencil"
              >
                <i className="fas fa-pencil-alt"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.FILL ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.FILL)}
                title="Fill"
              >
                <i className="fas fa-fill-drip"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.RECTANGLE ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.RECTANGLE)}
                title="Filled Rectangle"
              >
                <i className="fas fa-square"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.RECTANGLE_BORDER ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.RECTANGLE_BORDER)}
                title="Rectangle Border"
              >
                <i className="far fa-square"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.SELECT ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.SELECT)}
                title="Select Area"
              >
                <i className="fas fa-crop-alt"></i>
              </button>
              <button 
                className="tool-button"
                onClick={() => selectionManager.copySelection(gridData)}
                disabled={!selectionManager.hasSelection() || selectionManager.currentSelection?.gridId !== id}
                title="Copy Selection (Ctrl+C)"
              >
                <i className="far fa-copy"></i>
              </button>
              <button 
                className="tool-button"
                onClick={() => selectionManager.cutSelection(gridData, setGridData)}
                disabled={!selectionManager.hasSelection() || selectionManager.currentSelection?.gridId !== id}
                title="Cut Selection (Ctrl+X)"
              >
                <i className="fas fa-cut"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.PASTE ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.PASTE)}
                disabled={!hasCopiedData}
                title="Paste (Ctrl+V)"
              >
                <i className="far fa-clipboard"></i>
              </button>
              <div className="tool-separator"></div>
              <button 
                className="tool-button clear-canvas"
                onClick={handleClearCanvas}
                title="Clear Canvas"
              >
                <i className="far fa-file"></i>
              </button>
              <button 
                className="tool-button"
                onClick={handleUndo}
                disabled={!history.canUndo}
                title="Undo"
              >
                <i className="fas fa-undo"></i>
              </button>
              <button 
                className="tool-button"
                onClick={handleRedo}
                disabled={!history.canRedo}
                title="Redo"
              >
                <i className="fas fa-redo"></i>
              </button>
            </div>
            <div className="color-palette">
              {COLORS.map(({ id, name, color, hoverColor }) => (
                <button
                  key={id}
                  className={`color-button ${intensity === id ? 'active' : ''}`}
                  style={{ 
                    '--color': color,
                    '--hover-color': hoverColor
                  }}
                  title={name}
                  onClick={() => handleToolChange(null, id)}
                >
                  <span className="color-preview"></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(year)}
        className="remove-year"
        title="Remove year"
      >
        ×
      </button>
      <ContributionGrid 
        id={id}
        year={year}
        activeTool={activeTool}
        intensity={intensity}
        gridData={gridData}
        setGridData={handleGridChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onToolChange={handleToolChange}
      />
    </div>
  );
};

export default YearGridContainer; 