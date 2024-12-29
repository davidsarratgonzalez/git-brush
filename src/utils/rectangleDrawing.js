import { drawEmptyGrid } from './gridDrawing';

export function drawRectangle(
  start,
  end,
  isBorder,
  commit,
  canvasRef,
  gridData,
  setGridData,
  intensity,
  cellSize,
  cellPadding,
  gridColors
) {
  if (!start || !end) return;

  const ctx = canvasRef.current.getContext('2d');
  const newGridData = [...gridData];

  // Get rectangle bounds
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  // Always redraw the grid to show the current state
  drawEmptyGrid(ctx, gridData, cellSize, cellPadding, gridColors);

  // Draw rectangle
  if (isBorder) {
    // Border only
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (row === minRow || row === maxRow || col === minCol || col === maxCol) {
          if (gridData[row] && gridData[row][col] !== null) {
            if (commit) {
              newGridData[row][col] = intensity;
            }
            const x = col * (cellSize + cellPadding);
            const y = row * (cellSize + cellPadding);
            ctx.fillStyle = gridColors[intensity];
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }
  } else {
    // Filled rectangle
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (gridData[row] && gridData[row][col] !== null) {
          if (commit) {
            newGridData[row][col] = intensity;
          }
          const x = col * (cellSize + cellPadding);
          const y = row * (cellSize + cellPadding);
          ctx.fillStyle = gridColors[intensity];
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }

  if (commit) {
    setGridData(newGridData);
  }
} 