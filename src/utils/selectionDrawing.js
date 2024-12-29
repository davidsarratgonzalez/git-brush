export const drawSelectionArea = (ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING, gridData) => {
  // Clear any previous selection animation
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Calculate cell-based bounds
  const startCol = Math.min(startCoords.col, endCoords.col);
  const endCol = Math.max(startCoords.col, endCoords.col);
  const startRow = Math.min(startCoords.row, endCoords.row);
  const endRow = Math.max(startCoords.row, endCoords.row);

  // Draw blue overlay only for valid cells
  ctx.fillStyle = 'rgba(9, 105, 218, 0.1)'; // Light blue with transparency
  
  // Track the actual bounds of valid cells for the border
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      // Only draw if this is a valid cell (not null)
      if (gridData[row] && gridData[row][col] !== null) {
        const x = col * (CELL_SIZE + CELL_PADDING);
        const y = row * (CELL_SIZE + CELL_PADDING);
        
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Update actual bounds
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + CELL_SIZE);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + CELL_SIZE);
      }
    }
  }

  // Only draw border if we found valid cells
  if (minX !== Infinity) {
    // Draw animated dashed border around the actual content
    ctx.save();
    ctx.strokeStyle = '#0969da';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -performance.now() / 50; // Animate dash
    ctx.strokeRect(
      minX - 1, // Slight offset for border
      minY - 1,
      maxX - minX + 2, // Add offset to both sides
      maxY - minY + 2
    );
    ctx.restore();
  }

  // Request next animation frame
  return requestAnimationFrame(() => 
    drawSelectionArea(ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING, gridData)
  );
}; 