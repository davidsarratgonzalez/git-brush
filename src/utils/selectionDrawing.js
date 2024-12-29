export const drawSelectionArea = (ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING) => {
  // Clear any previous selection animation
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Calculate cell-based bounds
  const startCol = Math.min(startCoords.col, endCoords.col);
  const endCol = Math.max(startCoords.col, endCoords.col);
  const startRow = Math.min(startCoords.row, endCoords.row);
  const endRow = Math.max(startCoords.row, endCoords.row);

  // Get grid data from canvas dimensions
  const totalRows = Math.floor(ctx.canvas.height / (CELL_SIZE + CELL_PADDING));
  const totalCols = Math.floor(ctx.canvas.width / (CELL_SIZE + CELL_PADDING));

  // Draw blue overlay only for valid cells
  ctx.fillStyle = 'rgba(9, 105, 218, 0.1)'; // Light blue with transparency
  for (let row = startRow; row <= endRow && row < totalRows; row++) {
    for (let col = startCol; col <= endCol && col < totalCols; col++) {
      // Skip drawing if we're outside valid grid bounds
      if (row < 0 || col < 0) continue;

      const x = col * (CELL_SIZE + CELL_PADDING);
      const y = row * (CELL_SIZE + CELL_PADDING);
      
      // Only draw if the cell position is valid (would contain a cell in the grid)
      if (x < ctx.canvas.width && y < ctx.canvas.height) {
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // Calculate border coordinates, clamped to valid grid area
  const x1 = Math.max(0, startCol * (CELL_SIZE + CELL_PADDING));
  const y1 = Math.max(0, startRow * (CELL_SIZE + CELL_PADDING));
  const x2 = Math.min(
    ctx.canvas.width,
    (endCol + 1) * (CELL_SIZE + CELL_PADDING) - CELL_PADDING
  );
  const y2 = Math.min(
    ctx.canvas.height,
    (endRow + 1) * (CELL_SIZE + CELL_PADDING) - CELL_PADDING
  );

  const width = x2 - x1;
  const height = y2 - y1;

  // Draw animated dashed border
  ctx.save();
  ctx.strokeStyle = '#0969da';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -performance.now() / 50; // Animate dash
  ctx.strokeRect(x1, y1, width, height);
  ctx.restore();

  // Request next animation frame
  return requestAnimationFrame(() => 
    drawSelectionArea(ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING)
  );
}; 