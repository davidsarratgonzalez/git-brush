import { drawEmptyGrid } from './gridDrawing';

/**
 * Draws a rectangle on the contribution grid, either filled or border-only
 * 
 * @param {Object} start - Starting coordinates {row, col} of rectangle
 * @param {Object} end - Ending coordinates {row, col} of rectangle
 * @param {boolean} isBorder - Whether to draw only the border (true) or fill the rectangle (false)
 * @param {boolean} commit - Whether to commit the changes to grid data
 * @param {React.RefObject} canvasRef - Reference to canvas element
 * @param {Array<Array<number|null>>} gridData - 2D array of current grid data
 * @param {Function} setGridData - Function to update grid data
 * @param {number} intensity - Color intensity level to draw (0-4)
 * @param {number} cellSize - Size of each cell in pixels
 * @param {number} cellPadding - Padding between cells in pixels
 * @param {string[]} gridColors - Array of colors for different intensities
 */
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

  // Calculate rectangle boundaries
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  // Redraw base grid
  drawEmptyGrid(ctx, gridData, cellSize, cellPadding, gridColors);

  // Draw rectangle based on mode
  if (isBorder) {
    // Draw border-only rectangle
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
    // Draw filled rectangle
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

  // Update grid data if committing changes
  if (commit) {
    setGridData(newGridData);
  }
}