export const drawSelectionArea = (ctx, startCoords, endCoords, CELL_SIZE, CELL_PADDING) => {
  // Clear any previous selection animation
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Calculate cell-based bounds
  const startCol = Math.min(startCoords.col, endCoords.col);
  const endCol = Math.max(startCoords.col, endCoords.col);
  const startRow = Math.min(startCoords.row, endCoords.row);
  const endRow = Math.max(startCoords.row, endCoords.row);

  // Draw blue overlay for selected cells
  ctx.fillStyle = 'rgba(9, 105, 218, 0.1)'; // Light blue with transparency
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const x = col * (CELL_SIZE + CELL_PADDING);
      const y = row * (CELL_SIZE + CELL_PADDING);
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }
  }

  // Draw outer border around the entire selection
  const x1 = startCol * (CELL_SIZE + CELL_PADDING);
  const y1 = startRow * (CELL_SIZE + CELL_PADDING);
  const x2 = (endCol + 1) * (CELL_SIZE + CELL_PADDING) - CELL_PADDING;
  const y2 = (endRow + 1) * (CELL_SIZE + CELL_PADDING) - CELL_PADDING;
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