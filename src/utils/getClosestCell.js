/**
 * Determines which cell is closest to a given x,y coordinate,
 * even if it's in the "padding" zone between cells.
 */
export default function getClosestCell(
  x,
  y,
  gridData,
  cellSize,
  cellPadding
) {
  const baseCol = Math.floor(x / (cellSize + cellPadding));
  const baseRow = Math.floor(y / (cellSize + cellPadding));

  const xInUnit = x - baseCol * (cellSize + cellPadding);
  const yInUnit = y - baseRow * (cellSize + cellPadding);

  let row = baseRow;
  let col = baseCol;

  if (xInUnit > cellSize || yInUnit > cellSize) {
    // Check horizontal distance
    if (xInUnit > cellSize) {
      const distToCurrentCell = xInUnit - cellSize;
      const distToNextCell = (cellSize + cellPadding) - xInUnit;
      if (distToNextCell < distToCurrentCell) {
        col = baseCol + 1;
      }
    }
    // Check vertical distance
    if (yInUnit > cellSize) {
      const distToCurrentCell = yInUnit - cellSize;
      const distToNextCell = (cellSize + cellPadding) - yInUnit;
      if (distToNextCell < distToCurrentCell) {
        row = baseRow + 1;
      }
    }
  }

  // Find valid cell boundaries
  const maxCol = gridData[0].length - 1;
  const maxRow = gridData.length - 1;

  // Clamp to valid cells only (where cell !== null)
  let validCol = Math.max(0, Math.min(col, maxCol));
  let validRow = Math.max(0, Math.min(row, maxRow));

  // Find nearest valid cell if current cell is null
  while (validCol >= 0 && gridData[validRow][validCol] === null) {
    validCol--;
  }
  
  // If no valid cell found to the left, try right
  if (validCol < 0) {
    validCol = 0;
    while (validCol <= maxCol && gridData[validRow][validCol] === null) {
      validCol++;
    }
  }

  // If still no valid cell found, clamp to nearest valid row
  if (validCol > maxCol) {
    validCol = Math.min(col, maxCol);
  }

  return { row: validRow, col: validCol };
} 