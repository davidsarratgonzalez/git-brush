/**
 * Determines which cell is closest to a given x,y coordinate,
 * even if it's in the "padding" zone between cells.
 */
export default function getClosestCell(x, y, gridData, cellSize, cellPadding, isSelection = false) {
  const totalCellSize = cellSize + cellPadding;
  
  // Calculate row and column
  let row = Math.floor(y / totalCellSize);
  let col = Math.floor(x / totalCellSize);
  
  // Limit row to valid range (0-6 for contribution grid)
  row = Math.max(0, Math.min(row, 6));
  
  // Find the last column that contains any non-null cells
  let lastValidCol = 0;
  for (let c = gridData[0].length - 1; c >= 0; c--) {
    // Check if any cell in this column is non-null
    for (let r = 0; r < gridData.length; r++) {
      if (gridData[r][c] !== null) {
        lastValidCol = c;
        break;
      }
    }
    if (lastValidCol > 0) break;
  }
  
  // Limit column to valid range
  col = Math.max(0, Math.min(col, lastValidCol));
  
  return { row, col };
} 