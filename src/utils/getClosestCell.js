/**
 * Determines which cell is closest to a given x,y coordinate,
 * even if it's in the "padding" zone between cells.
 */
export default function getClosestCell(
  x,
  y,
  gridData,
  cellSize,
  cellPadding,
  isSelecting = false
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

  // For selection tool, just clamp to grid bounds without checking for null cells
  if (isSelecting) {
    return {
      row: Math.max(0, Math.min(row, gridData.length - 1)),
      col: Math.max(0, Math.min(col, gridData[0].length - 1))
    };
  }

  // For other tools, find nearest valid cell
  const maxCol = gridData[0].length - 1;
  const maxRow = gridData.length - 1;

  let validCol = Math.max(0, Math.min(col, maxCol));
  let validRow = Math.max(0, Math.min(row, maxRow));

  while (validCol >= 0 && gridData[validRow][validCol] === null) {
    validCol--;
  }
  
  if (validCol < 0) {
    validCol = 0;
    while (validCol <= maxCol && gridData[validRow][validCol] === null) {
      validCol++;
    }
  }

  if (validCol > maxCol) {
    validCol = Math.min(col, maxCol);
  }

  return { row: validRow, col: validCol };
} 