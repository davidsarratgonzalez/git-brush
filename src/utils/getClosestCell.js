/**
 * Finds the closest valid grid cell to a given coordinate point
 * 
 * @param {number} x - X coordinate to check
 * @param {number} y - Y coordinate to check  
 * @param {Array<Array<number|null>>} gridData - 2D array representing the contribution grid
 * @param {number} cellSize - Width/height of each cell in pixels
 * @param {number} cellPadding - Padding between cells in pixels
 * @param {boolean} isSelection - Whether this is for selection mode
 * @returns {Object} Object containing row and column indices of closest cell
 */
export default function getClosestCell(x, y, gridData, cellSize, cellPadding, isSelection = false) {
  const totalCellSize = cellSize + cellPadding;

  let row = Math.floor(y / totalCellSize);
  let col = Math.floor(x / totalCellSize);

  row = Math.max(0, Math.min(row, 6));

  let lastValidCol = 0;
  for (let c = gridData[0].length - 1; c >= 0; c--) {
    for (let r = 0; r < gridData.length; r++) {
      if (gridData[r][c] !== null) {
        lastValidCol = c;
        break;
      }
    }
    if (lastValidCol > 0) break;
  }

  col = Math.max(0, Math.min(col, lastValidCol));

  return { row, col };
}