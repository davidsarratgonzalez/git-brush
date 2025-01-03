// Import required React hooks and utility functions
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { TOOLS } from './PaintTools';
import getClosestCell from '../utils/getClosestCell';
import * as GridDrawing from '../utils/gridDrawing';
import * as CellDrawing from '../utils/cellDrawing';
import * as RectangleDrawing from '../utils/rectangleDrawing';
import { drawSelectionArea } from '../utils/selectionDrawing';
import { selectionManager } from '../utils/selectionManager';

// Component for rendering an interactive contribution grid
const ContributionGrid = ({ 
  id, 
  year, 
  activeTool, 
  intensity, 
  gridData, 
  setGridData,
  onMouseDown,
  onMouseUp,
  onToolChange
}) => {
  // Canvas and drawing state refs
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionAnimationFrame, setSelectionAnimationFrame] = useState(null);
  const selectionCanvasRef = useRef(null); // Overlay canvas for selection
  const [pastePreviewPos, setPastePreviewPos] = useState(null);
  const [pasteOffset, setPasteOffset] = useState({ row: 0, col: 0 });

  // Grid rendering constants
  const CELL_SIZE = 10;
  const CELL_PADDING = 2;

  // Color palette for contribution levels
  const GRID_COLORS = useMemo(() => [
    '#ebedf0', // 0: empty/none
    '#9be9a8', // 1: light
    '#40c463', // 2: medium
    '#30a14e', // 3: dark
    '#216e39'  // 4: darker
  ], []);

  // Selection styling constants
  const SELECTION_BORDER_WIDTH = 2;
  const SELECTION_PADDING = 4;

  // Initialize empty grid
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    GridDrawing.drawEmptyGrid(ctx, gridData, CELL_SIZE, CELL_PADDING, GRID_COLORS);
  }, [gridData, CELL_SIZE, CELL_PADDING, GRID_COLORS]);

  // Handle clicks outside selection area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!selectionCanvasRef.current?.contains(e.target)) {
        if (selectionAnimationFrame) {
          cancelAnimationFrame(selectionAnimationFrame);
          const ctx = selectionCanvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectionAnimationFrame]);

  // Clear selection helper function
  const clearSelection = useCallback(() => {
    if (selectionCanvasRef.current) {
      const ctx = selectionCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      setSelectionStart(null);
    }
  }, []);

  // Clear selection when changing tools
  useEffect(() => {
    if (activeTool !== TOOLS.SELECT) {
      clearSelection();
      selectionManager.clearSelection();
    }
  }, [activeTool, clearSelection]);

  // Sync selection state across grids
  useEffect(() => {
    const unsubscribe = selectionManager.subscribe((selection) => {
      if (!selection || selection.gridId !== id) {
        clearSelection();
      }
    });
    return unsubscribe;
  }, [id, clearSelection]);

  // Handle copy/cut keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectionManager.hasSelection()) return;
      
      if (selectionManager.currentSelection.gridId !== id) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        selectionManager.copySelection(gridData);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        selectionManager.cutSelection(gridData, setGridData);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id, gridData, setGridData]);

  // Render paste preview
  useEffect(() => {
    if (activeTool === TOOLS.PASTE && selectionManager.hasCopiedData() && pastePreviewPos) {
      const ctx = selectionCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      const { data, width, height } = selectionManager.copiedData;
      
      // Draw preview cells
      for (let r = 0; r < height; r++) {
        if (pastePreviewPos.row + r + pasteOffset.row >= gridData.length || 
            pastePreviewPos.row + r + pasteOffset.row < 0) continue;
        
        for (let c = 0; c < width; c++) {
          if (pastePreviewPos.col + c + pasteOffset.col >= gridData[0].length || 
              pastePreviewPos.col + c + pasteOffset.col < 0) continue;
          
          if (data[r][c] === null) continue;
          
          if (gridData[pastePreviewPos.row + r + pasteOffset.row][pastePreviewPos.col + c + pasteOffset.col] === null) continue;
          
          const x = (pastePreviewPos.col + c + pasteOffset.col) * (CELL_SIZE + CELL_PADDING);
          const y = (pastePreviewPos.row + r + pasteOffset.row) * (CELL_SIZE + CELL_PADDING);
          
          // Cell fill
          ctx.fillStyle = GRID_COLORS[data[r][c]];
          ctx.fillRect(
            x + SELECTION_PADDING, 
            y + SELECTION_PADDING, 
            CELL_SIZE, 
            CELL_SIZE
          );
          
          // Preview border
          ctx.strokeStyle = '#1a73e8';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            x + SELECTION_PADDING, 
            y + SELECTION_PADDING, 
            CELL_SIZE, 
            CELL_SIZE
          );
        }
      }
    }
  }, [activeTool, pastePreviewPos, CELL_SIZE, CELL_PADDING, GRID_COLORS, gridData, pasteOffset]);

  // Handle paste keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && selectionManager.hasCopiedData()) {
        e.preventDefault();
        onToolChange?.(TOOLS.PASTE);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle mouse down events
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    
    if (activeTool === TOOLS.PASTE && selectionManager.hasCopiedData() && pastePreviewPos) {
      const { data, width, height } = selectionManager.copiedData;
      const newGrid = [...gridData];
      
      let hasValidPaste = false;
      
      // Apply paste data to grid
      for (let r = 0; r < height; r++) {
        if (pastePreviewPos.row + r + pasteOffset.row >= gridData.length || 
            pastePreviewPos.row + r + pasteOffset.row < 0) continue;
            
        newGrid[pastePreviewPos.row + r + pasteOffset.row] = [...gridData[pastePreviewPos.row + r + pasteOffset.row]];
        
        for (let c = 0; c < width; c++) {
          if (pastePreviewPos.col + c + pasteOffset.col >= gridData[0].length || 
              pastePreviewPos.col + c + pasteOffset.col < 0) continue;
          
          if (data[r][c] === null) continue;
          
          if (gridData[pastePreviewPos.row + r + pasteOffset.row][pastePreviewPos.col + c + pasteOffset.col] !== null) {
            newGrid[pastePreviewPos.row + r + pasteOffset.row][pastePreviewPos.col + c + pasteOffset.col] = data[r][c];
            hasValidPaste = true;
          }
        }
      }
      
      if (hasValidPaste) {
        setGridData(newGrid);
      }
      return;
    }

    isDrawingRef.current = true;
    onMouseDown?.();

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const coords = getClosestCell(x, y, gridData, CELL_SIZE, CELL_PADDING, activeTool === TOOLS.SELECT);
    setSelectionStart(coords);

    // Handle initial draw based on active tool
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
    } else if (activeTool === TOOLS.SELECT) {
      const ctx = selectionCanvasRef.current.getContext('2d');
      drawSelectionArea(
        ctx,
        coords,
        coords,
        CELL_SIZE,
        CELL_PADDING,
        gridData
      );
      
      selectionManager.setSelection({
        gridId: id,
        clearFn: clearSelection,
        startCoords: coords,
        endCoords: coords
      });
    }
  }, [
    activeTool,
    gridData,
    intensity,
    CELL_SIZE,
    CELL_PADDING,
    GRID_COLORS,
    setGridData,
    onMouseDown,
    id,
    clearSelection,
    pastePreviewPos,
    pasteOffset
  ]);

  // Handle mouse move events
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    const coords = getClosestCell(x, y, gridData, CELL_SIZE, CELL_PADDING, activeTool === TOOLS.SELECT);

    if (activeTool === TOOLS.PASTE && selectionManager.hasCopiedData()) {
      setPastePreviewPos(coords);
      return;
    }

    if (!isDrawingRef.current) return;

    // Handle drawing based on active tool
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
    } else if (activeTool === TOOLS.SELECT && isDrawingRef.current) {
      const ctx = selectionCanvasRef.current.getContext('2d');
      drawSelectionArea(
        ctx,
        selectionStart,
        coords,
        CELL_SIZE,
        CELL_PADDING,
        gridData
      );
      
      if (selectionManager.currentSelection?.gridId === id) {
        selectionManager.currentSelection.endCoords = coords;
      }
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
    id,
    pastePreviewPos
  ]);

  // Handle mouse up events
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
      onMouseUp?.();
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

  // Handle global mouse events
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

  // Clear paste preview on tool change
  useEffect(() => {
    if (activeTool !== TOOLS.PASTE) {
      setPastePreviewPos(null);
      if (selectionCanvasRef.current) {
        const ctx = selectionCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
  }, [activeTool]);

  // Handle mouse leave events
  const handleMouseLeave = useCallback(() => {
    if (activeTool === TOOLS.PASTE) {
      setPastePreviewPos(null);
      if (selectionCanvasRef.current) {
        const ctx = selectionCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
  }, [activeTool]);

  // Reset paste offset on tool change
  useEffect(() => {
    if (activeTool !== TOOLS.PASTE) {
      setPasteOffset({ row: 0, col: 0 });
    }
  }, [activeTool]);

  // Handle arrow key navigation for paste
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTool !== TOOLS.PASTE || !pastePreviewPos) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPasteOffset(prev => ({ ...prev, row: prev.row - 1 }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPasteOffset(prev => ({ ...prev, row: prev.row + 1 }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPasteOffset(prev => ({ ...prev, col: prev.col - 1 }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPasteOffset(prev => ({ ...prev, col: prev.col + 1 }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, pastePreviewPos]);

  return (
    <div 
      className="contribution-grid" 
      style={{ 
        position: 'relative',
        padding: SELECTION_PADDING,
        boxSizing: 'border-box'
      }}
    >
      <canvas
        id={id}
        ref={canvasRef}
        width={53 * (CELL_SIZE + CELL_PADDING)}
        height={7 * (CELL_SIZE + CELL_PADDING)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ 
          width: '100%',
          display: 'block'
        }}
      />
      <canvas
        ref={selectionCanvasRef}
        width={53 * (CELL_SIZE + CELL_PADDING) + (SELECTION_PADDING * 2)}
        height={7 * (CELL_SIZE + CELL_PADDING) + (SELECTION_PADDING * 2)}
        style={{
          position: 'absolute',
          top: -SELECTION_PADDING,
          left: -SELECTION_PADDING,
          pointerEvents: 'none',
          width: `calc(100% + ${SELECTION_PADDING * 2}px)`,
          height: `calc(100% + ${SELECTION_PADDING * 2}px)`,
          display: 'block'
        }}
      />
    </div>
  );
};

export default ContributionGrid;