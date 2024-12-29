export const drawSelectionArea = (ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING, gridData) => {
  // Clear any previous selection animation
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const SELECTION_PADDING = 4; // Match the padding from ContributionGrid

  // Calculate cell-based bounds
  const startCol = Math.min(startCoords.col, endCoords.col);
  const endCol = Math.max(startCoords.col, endCoords.col);
  const startRow = Math.min(startCoords.row, endCoords.row);
  const endRow = Math.max(startCoords.row, endCoords.row);

  // Draw blue overlay only for valid cells
  ctx.fillStyle = 'rgba(9, 105, 218, 0.1)';
  
  // Track the actual bounds of valid cells for the border
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (gridData[row] && gridData[row][col] !== null) {
        // Add padding offset to x,y coordinates
        const x = col * (CELL_SIZE + CELL_PADDING) + SELECTION_PADDING;
        const y = row * (CELL_SIZE + CELL_PADDING) + SELECTION_PADDING;
        
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + CELL_SIZE);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + CELL_SIZE);
      }
    }
  }

  if (minX !== Infinity) {
    ctx.save();
    ctx.strokeStyle = '#0969da';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -performance.now() / 50;
    ctx.strokeRect(
      minX - 1,
      minY - 1,
      maxX - minX + 2,
      maxY - minY + 2
    );
    ctx.restore();
  }

  return requestAnimationFrame(() => 
    drawSelectionArea(ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING, gridData)
  );
}; 