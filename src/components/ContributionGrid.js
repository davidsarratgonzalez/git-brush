import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PaintTools, { TOOLS } from './PaintTools';
import useGridLogic from '../hooks/useGridLogic';
import getClosestCell from '../utils/getClosestCell';

// Re-import our helpers as stable references (no destructuring),
// so we won't have ESLint issues about "no-undef" or "invalid dependencies"
import * as GridDrawing from '../utils/gridDrawing';
import * as CellDrawing from '../utils/cellDrawing';
import * as RectangleDrawing from '../utils/rectangleDrawing';

const ContributionGrid = ({ year, onGridChange }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [intensity, setIntensity] = useState(1);
  const [gridData, setGridData] = useState([]);
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL);
  const [selectionStart, setSelectionStart] = useState(null);

  // Pull calendar info from our custom hook
  const { calendarInfo, isValidDay } = useGridLogic(year);
  const { firstDay, totalDays } = calendarInfo;

  const CELL_SIZE = 10;
  const CELL_PADDING = 2;

  const GRID_COLORS = useMemo(() => [
    '#ebedf0', // 0: empty/none
    '#9be9a8', // 1: light
    '#40c463', // 2: medium
    '#30a14e', // 3: dark
    '#216e39'  // 4: darker
  ], []);

  const handleToolChange = useCallback((tool, newIntensity) => {
    setActiveTool(tool);
    if (newIntensity !== undefined) {
      setIntensity(newIntensity);
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const coords = getClosestCell(x, y, gridData, CELL_SIZE, CELL_PADDING);

    isDrawingRef.current = true;
    setSelectionStart(coords);

    if (activeTool === TOOLS.PENCIL) {
      CellDrawing.drawCell(
        coords, 
        gridData, 
        setGridData, 
        intensity, 
        canvasRef,
        CELL_SIZE, 
        CELL_PADDING, 
        GRID_COLORS
      );
    } else if (activeTool === TOOLS.FILL) {
      CellDrawing.fillArea(
        coords, 
        gridData, 
        setGridData, 
        intensity, 
        canvasRef,
        CELL_SIZE, 
        CELL_PADDING, 
        GRID_COLORS
      );
    } else if (
      activeTool === TOOLS.RECTANGLE ||
      activeTool === TOOLS.RECTANGLE_BORDER
    ) {
      RectangleDrawing.drawRectangle(
        coords,
        coords,
        activeTool === TOOLS.RECTANGLE_BORDER,
        false,
        canvasRef,
        gridData,
        setGridData,
        intensity,
        CELL_SIZE,
        CELL_PADDING,
        GRID_COLORS
      );
    }
  }, [
    activeTool,
    gridData,
    intensity,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS
  ]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawingRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const coords = getClosestCell(x, y, gridData, CELL_SIZE, CELL_PADDING);

    if (activeTool === TOOLS.PENCIL) {
      CellDrawing.drawCell(
        coords,
        gridData,
        setGridData,
        intensity,
        canvasRef,
        CELL_SIZE,
        CELL_PADDING,
        GRID_COLORS
      );
    } else if (
      activeTool === TOOLS.RECTANGLE ||
      activeTool === TOOLS.RECTANGLE_BORDER
    ) {
      RectangleDrawing.drawRectangle(
        selectionStart,
        coords,
        activeTool === TOOLS.RECTANGLE_BORDER,
        false,
        canvasRef,
        gridData,
        setGridData,
        intensity,
        CELL_SIZE,
        CELL_PADDING,
        GRID_COLORS
      );
    }
  }, [
    activeTool,
    gridData,
    intensity,
    selectionStart,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS
  ]);

  const handleMouseUp = useCallback((e) => {
    if (isDrawingRef.current && selectionStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = canvasRef.current.width / rect.width;
      const x = (e.clientX - rect.left) * scale;
      const y = (e.clientY - rect.top) * scale;

      const coords = getClosestCell(x, y, gridData, CELL_SIZE, CELL_PADDING);

      if (
        activeTool === TOOLS.RECTANGLE ||
        activeTool === TOOLS.RECTANGLE_BORDER
      ) {
        RectangleDrawing.drawRectangle(
          selectionStart,
          coords,
          activeTool === TOOLS.RECTANGLE_BORDER,
          true,
          canvasRef,
          gridData,
          setGridData,
          intensity,
          CELL_SIZE,
          CELL_PADDING,
          GRID_COLORS
        );
      }
    }
    isDrawingRef.current = false;
    setSelectionStart(null);
  }, [
    activeTool,
    gridData,
    intensity,
    selectionStart,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS
  ]);

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDrawingRef.current) {
        handleMouseMove(e);
      }
    };
    const handleGlobalMouseUp = (e) => {
      if (isDrawingRef.current) {
        handleMouseUp(e);
      }
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // On mount, initialize grid
  useEffect(() => {
    // We'll compute totalWeeks etc. inside the initializeGridData call
    // using isValidDay + firstDay + totalDays from the hook
    const ctx = canvasRef.current.getContext('2d');

    // We can do this calculation inline:
    const totalWeeks = Math.ceil((totalDays + firstDay) / 7);
    const newGrid = Array(7).fill(null).map(() => Array(totalWeeks).fill(null));

    // Fill valid days
    for (let c = 0; c < totalWeeks; c++) {
      for (let r = 0; r < 7; r++) {
        if (isValidDay(r, c)) {
          newGrid[r][c] = 0;
        }
      }
    }

    setGridData(newGrid);
    GridDrawing.drawEmptyGrid(ctx, newGrid, CELL_SIZE, CELL_PADDING, GRID_COLORS);
  }, [
    year,
    firstDay,
    totalDays,
    isValidDay,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS
  ]);

  return (
    <div className="contribution-grid">
      <PaintTools
        activeTool={activeTool}
        onToolChange={handleToolChange}
        intensity={intensity}
        onIntensityChange={setIntensity}
      />
      <canvas
        ref={canvasRef}
        width={53 * (CELL_SIZE + CELL_PADDING)}
        height={7 * (CELL_SIZE + CELL_PADDING)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default ContributionGrid; 