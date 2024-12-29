import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PaintTools, { TOOLS } from './PaintTools';

const ContributionGrid = ({ year, onGridChange }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [gridData, setGridData] = useState([]);
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL);
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

  const isLeapYear = useCallback((year) => {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  }, []);

  const getFirstDayOfYear = useCallback((year) => {
    return new Date(year, 0, 1).getDay();
  }, []);

  const getDaysInYear = useCallback((year) => {
    return isLeapYear(year) ? 366 : 365;
  }, [isLeapYear]);

  const isValidDay = useCallback((row, col) => {
    const firstDay = getFirstDayOfYear(year);
    const totalDays = getDaysInYear(year);
    const dayNumber = col * 7 + row - firstDay;
    return dayNumber >= 0 && dayNumber < totalDays;
  }, [getFirstDayOfYear, getDaysInYear, year]);

  const getGridCoordinates = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    // Calculate initial position
    let col = Math.floor(x / (CELL_SIZE + CELL_PADDING));
    let row = Math.floor(y / (CELL_SIZE + CELL_PADDING));
    
    // Clamp values to grid boundaries
    col = Math.max(0, Math.min(col, gridData[0].length - 1));
    row = Math.max(0, Math.min(row, 6));  // 7 rows (0-6)
    
    // Only check for valid cell if we're not dragging
    if (!isDrawing) {
      const xInUnit = x - col * (CELL_SIZE + CELL_PADDING);
      const yInUnit = y - row * (CELL_SIZE + CELL_PADDING);
      if (xInUnit > CELL_SIZE || yInUnit > CELL_SIZE) {
        return null;
      }
    }
    
    return { row, col };
  }, [CELL_SIZE, CELL_PADDING, gridData, isDrawing]);

  const drawCell = useCallback((coords) => {
    if (!coords || !gridData[coords.row] || gridData[coords.row][coords.col] === null) return;
    
    const newGridData = [...gridData];
    newGridData[coords.row][coords.col] = intensity;
    setGridData(newGridData);

    const ctx = canvasRef.current.getContext('2d');
    const x = coords.col * (CELL_SIZE + CELL_PADDING);
    const y = coords.row * (CELL_SIZE + CELL_PADDING);
    
    ctx.fillStyle = GRID_COLORS[intensity];
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
  }, [gridData, intensity, CELL_SIZE, CELL_PADDING, GRID_COLORS]);

  const fillArea = useCallback((coords) => {
    if (!coords || !gridData[coords.row] || gridData[coords.row][coords.col] === null) return;
    
    const targetIntensity = gridData[coords.row][coords.col];
    if (targetIntensity === intensity) return;

    const newGridData = [...gridData];
    const fill = (r, c) => {
      if (
        r < 0 || r >= 7 || c < 0 || c >= gridData[0].length ||
        newGridData[r][c] !== targetIntensity ||
        newGridData[r][c] === null
      ) return;

      newGridData[r][c] = intensity;
      const ctx = canvasRef.current.getContext('2d');
      const x = c * (CELL_SIZE + CELL_PADDING);
      const y = r * (CELL_SIZE + CELL_PADDING);
      ctx.fillStyle = GRID_COLORS[intensity];
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      
      fill(r + 1, c);
      fill(r - 1, c);
      fill(r, c + 1);
      fill(r, c - 1);
    };

    fill(coords.row, coords.col);
    setGridData(newGridData);
  }, [gridData, intensity, CELL_SIZE, CELL_PADDING, GRID_COLORS]);

  const drawEmptyGrid = useCallback((ctx, data) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = colIndex * (CELL_SIZE + CELL_PADDING);
        const y = rowIndex * (CELL_SIZE + CELL_PADDING);
        
        if (cell === null) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = GRID_COLORS[cell];
        }
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      });
    });
  }, [CELL_SIZE, CELL_PADDING, GRID_COLORS]);

  const initializeGridData = useCallback(() => {
    const firstDay = getFirstDayOfYear(year);
    const totalDays = getDaysInYear(year);
    const totalWeeks = Math.ceil((totalDays + firstDay) / 7);
    
    const grid = Array(7).fill(null).map(() => Array(totalWeeks).fill(null));
    
    for (let col = 0; col < totalWeeks; col++) {
      for (let row = 0; row < 7; row++) {
        if (isValidDay(row, col)) {
          grid[row][col] = 0;
        }
      }
    }
    
    return grid;
  }, [getFirstDayOfYear, getDaysInYear, isValidDay, year]);

  const handleToolChange = useCallback((tool, newIntensity) => {
    setActiveTool(tool);
    if (newIntensity !== undefined) {
      setIntensity(newIntensity);
    }
  }, []);

  const drawRectangle = useCallback((start, end, isBorder = false, commit = false) => {
    if (!start || !end) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const newGridData = [...gridData];
    
    // Get rectangle bounds
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    // Always redraw the grid to show the current state
    drawEmptyGrid(ctx, gridData);

    // Draw rectangle
    if (isBorder) {
      // Draw only border cells
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          if (
            row === minRow || row === maxRow ||
            col === minCol || col === maxCol
          ) {
            if (gridData[row] && gridData[row][col] !== null) {
              // Only update grid data if committing
              if (commit) {
                newGridData[row][col] = intensity;
              }
              const x = col * (CELL_SIZE + CELL_PADDING);
              const y = row * (CELL_SIZE + CELL_PADDING);
              ctx.fillStyle = GRID_COLORS[intensity];
              ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
          }
        }
      }
    } else {
      // Draw filled rectangle
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          if (gridData[row] && gridData[row][col] !== null) {
            // Only update grid data if committing
            if (commit) {
              newGridData[row][col] = intensity;
            }
            const x = col * (CELL_SIZE + CELL_PADDING);
            const y = row * (CELL_SIZE + CELL_PADDING);
            ctx.fillStyle = GRID_COLORS[intensity];
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // Only update the grid data when committing
    if (commit) {
      setGridData(newGridData);
    }
  }, [gridData, intensity, CELL_SIZE, CELL_PADDING, GRID_COLORS, drawEmptyGrid]);

  const handleMouseDown = useCallback((e) => {
    const coords = getGridCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    isDrawingRef.current = true;  // Update ref
    setSelectionStart(coords);
    
    if (activeTool === TOOLS.PENCIL) {
      drawCell(coords);
    } else if (activeTool === TOOLS.FILL) {
      fillArea(coords);
    } else if (activeTool === TOOLS.RECTANGLE || activeTool === TOOLS.RECTANGLE_BORDER) {
      drawRectangle(coords, coords, activeTool === TOOLS.RECTANGLE_BORDER, false);
    }
  }, [activeTool, getGridCoordinates, drawCell, fillArea, drawRectangle]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawingRef.current) return;

    // Get coordinates and clamp them to grid even if mouse is outside
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    let x = (e.clientX - rect.left) * scale;
    let y = (e.clientY - rect.top) * scale;
    
    // Clamp x and y to grid boundaries
    x = Math.max(0, Math.min(x, canvasRef.current.width));
    y = Math.max(0, Math.min(y, canvasRef.current.height));
    
    let col = Math.floor(x / (CELL_SIZE + CELL_PADDING));
    let row = Math.floor(y / (CELL_SIZE + CELL_PADDING));
    
    // Clamp grid positions
    col = Math.max(0, Math.min(col, gridData[0].length - 1));
    row = Math.max(0, Math.min(row, 6));

    const coords = { row, col };

    if (activeTool === TOOLS.PENCIL) {
      drawCell(coords);
    } else if (activeTool === TOOLS.RECTANGLE || activeTool === TOOLS.RECTANGLE_BORDER) {
      drawRectangle(selectionStart, coords, activeTool === TOOLS.RECTANGLE_BORDER, false);
    }
  }, [activeTool, CELL_SIZE, CELL_PADDING, gridData, drawCell, drawRectangle, selectionStart]);

  const handleMouseUp = useCallback((e) => {
    if (isDrawingRef.current && selectionStart) {
      // Get coordinates and clamp them to grid even if mouse is outside
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = canvasRef.current.width / rect.width;
      let x = (e.clientX - rect.left) * scale;
      let y = (e.clientY - rect.top) * scale;
      
      // Clamp x and y to grid boundaries
      x = Math.max(0, Math.min(x, canvasRef.current.width));
      y = Math.max(0, Math.min(y, canvasRef.current.height));
      
      let col = Math.floor(x / (CELL_SIZE + CELL_PADDING));
      let row = Math.floor(y / (CELL_SIZE + CELL_PADDING));
      
      // Clamp grid positions
      col = Math.max(0, Math.min(col, gridData[0].length - 1));
      row = Math.max(0, Math.min(row, 6));

      const coords = { row, col };

      if (activeTool === TOOLS.RECTANGLE || activeTool === TOOLS.RECTANGLE_BORDER) {
        drawRectangle(selectionStart, coords, activeTool === TOOLS.RECTANGLE_BORDER, true);
      }
    }
    setIsDrawing(false);
    isDrawingRef.current = false;
    setSelectionStart(null);
  }, [activeTool, CELL_SIZE, CELL_PADDING, gridData, drawRectangle, selectionStart]);

  // Global mouse event handlers
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

  // Initialize grid
  useEffect(() => {
    const data = initializeGridData();
    setGridData(data);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawEmptyGrid(ctx, data);
  }, [initializeGridData, drawEmptyGrid]);

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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default ContributionGrid; 