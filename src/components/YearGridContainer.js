/**
 * @module YearGridContainer
 * A container component for managing a year's contribution grid and associated controls.
 * Handles drawing tools, history management, keyboard shortcuts, and grid interactions.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import ContributionGrid from './ContributionGrid';
import { TOOLS, COLORS } from './PaintTools';
import * as GridDrawing from '../utils/gridDrawing';
import { useHistory } from '../hooks/useHistory';
import { selectionManager } from '../utils/selectionManager';

/** @constant {number} Cell size in pixels */
const CELL_SIZE = 10;

/** @constant {number} Padding between cells in pixels */
const CELL_PADDING = 2;

/** @constant {string[]} Colors for different contribution levels */
const GRID_COLORS = [
  '#ebedf0', // 0: empty/none
  '#9be9a8', // 1: light
  '#40c463', // 2: medium
  '#30a14e', // 3: dark
  '#216e39'  // 4: darker
];

/**
 * @component
 * @param {Object} props
 * @param {number} props.year - Year being displayed
 * @param {Function} props.onRemove - Callback to remove this year's grid
 * @param {Array<Array<number>>} props.gridData - 2D array of grid cell values
 * @param {Function} props.setGridData - Callback to update grid data
 * @param {string} props.activeTool - Currently selected drawing tool
 * @param {number} props.intensity - Selected color intensity level (0-4)
 * @param {Function} props.onToolChange - Callback when tool selection changes
 * @param {boolean} props.hasCopiedData - Whether there is data in the clipboard
 */
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

  /**
   * Updates grid data without pushing to history
   * @param {Array<Array<number>>} newData - New grid data
   */
  const updateGrid = (newData) => {
    setGridData(newData);
  };

  /**
   * Completes an action by pushing final state to history
   * @param {Array<Array<number>>} finalData - Final grid state
   */
  const completeAction = (finalData) => {
    history.push(JSON.parse(JSON.stringify(finalData)));
    setGridData(finalData);
  };

  /**
   * Handles mouse down event by starting drawing state
   */
  const handleMouseDown = () => {
    isDrawingRef.current = true;
    startOfActionRef.current = JSON.parse(JSON.stringify(gridData));
  };

  /**
   * Handles mouse up event by completing drawing state
   */
  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      completeAction(gridData);
    }
  };

  /**
   * Handles grid data changes based on drawing state
   * @param {Array<Array<number>>} newData - New grid data
   */
  const handleGridChange = (newData) => {
    if (isDrawingRef.current) {
      updateGrid(newData);
    } else {
      completeAction(newData);
    }
  };

  /**
   * Handles tool selection changes
   * @param {string} tool - Selected tool
   * @param {number} newIntensity - Selected intensity level
   */
  const handleToolChange = (tool, newIntensity) => {
    onToolChange(tool, newIntensity);
  };

  /**
   * Clears the canvas by setting all cells to 0
   */
  const handleClearCanvas = () => {
    const canvas = document.querySelector(`#canvas-${year}`);
    const ctx = canvas.getContext('2d');
    const newGridData = gridData.map(row => 
      row.map(cell => cell !== null ? 0 : null)
    );
    handleGridChange(newGridData);
    GridDrawing.drawEmptyGrid(ctx, newGridData, CELL_SIZE, CELL_PADDING, GRID_COLORS);
  };

  /**
   * Handles undo action by restoring previous state
   */
  const handleUndo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      setGridData(previousState);
      const canvas = document.querySelector(`#canvas-${year}`);
      const ctx = canvas.getContext('2d');
      GridDrawing.drawEmptyGrid(ctx, previousState, CELL_SIZE, CELL_PADDING, GRID_COLORS);
    }
  }, [history, setGridData, year]);

  /**
   * Handles redo action by restoring next state
   */
  const handleRedo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setGridData(nextState);
      const canvas = document.querySelector(`#canvas-${year}`);
      const ctx = canvas.getContext('2d');
      GridDrawing.drawEmptyGrid(ctx, nextState, CELL_SIZE, CELL_PADDING, GRID_COLORS);
    }
  }, [history, setGridData, year]);

  /**
   * Handles mouse enter event
   */
  const handleMouseEnter = () => setIsHovered(true);

  /**
   * Handles mouse leave event
   */
  const handleMouseLeave = () => setIsHovered(false);

  /**
   * Sets up keyboard shortcuts for undo/redo
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isHovered) return;

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