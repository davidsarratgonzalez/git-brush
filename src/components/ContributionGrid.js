import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { TOOLS } from './PaintTools';
import getClosestCell from '../utils/getClosestCell';
import * as GridDrawing from '../utils/gridDrawing';
import * as CellDrawing from '../utils/cellDrawing';
import * as RectangleDrawing from '../utils/rectangleDrawing';

const ContributionGrid = ({ 
  id, 
  year, 
  activeTool, 
  intensity, 
  gridData, 
  setGridData,
  onMouseDown,
  onMouseUp
}) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [selectionStart, setSelectionStart] = useState(null);

  const CELL_SIZE = 10;
  const CELL_PADDING = 2;

  const GRID_COLORS = useMemo(() => [
    '#ebedf0', // 0: empty/none
    '#9be9a8', // 1: light
    '#40c463', // 2: medium
    '#30a14e', // 3: dark
    '#216e39'  // 4: darker
  ], []);

  // Add effect to draw initial grid
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    GridDrawing.drawEmptyGrid(ctx, gridData, CELL_SIZE, CELL_PADDING, GRID_COLORS);
  }, [gridData, CELL_SIZE, CELL_PADDING, GRID_COLORS]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    onMouseDown?.(); // Notify parent

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const coords = getClosestCell(x, y, gridData, CELL_SIZE, CELL_PADDING);
    setSelectionStart(coords);

    // Initial draw operation
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
    }
  }, [
    activeTool,
    gridData,
    intensity,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS,
    setGridData,
    onMouseDown
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
    GRID_COLORS,
    setGridData
  ]);

  const handleMouseUp = useCallback((e) => {
    if (isDrawingRef.current) {
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
      isDrawingRef.current = false;
      setSelectionStart(null);
      onMouseUp?.(); // Notify parent
    }
  }, [
    activeTool,
    gridData,
    intensity,
    selectionStart,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS,
    setGridData,
    onMouseUp
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

  return (
    <div className="contribution-grid">
      <canvas
        id={id}
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