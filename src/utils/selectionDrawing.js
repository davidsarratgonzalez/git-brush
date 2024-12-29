export function drawSelectionArea(
  ctx,
  start,
  end,
  cellSize,
  cellPadding,
  gridData
) {
  if (!start || !end) return;

  // Clear previous selection
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Get rectangle bounds
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  // Calculate exact pixel positions
  const startX = minCol * (cellSize + cellPadding);
  const startY = minRow * (cellSize + cellPadding);
  const width = (maxCol - minCol + 1) * (cellSize + cellPadding) - cellPadding;
  const height = (maxRow - minRow + 1) * (cellSize + cellPadding) - cellPadding;

  // Add selection padding offset (matches the canvas position offset)
  const SELECTION_PADDING = 4;
  const offsetX = SELECTION_PADDING;
  const offsetY = SELECTION_PADDING;

  // Draw selection rectangle
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  
  // Account for the offset in the drawing
  ctx.strokeRect(
    startX + offsetX,
    startY + offsetY,
    width,
    height
  );

  // Draw corner handles
  const handleSize = 6;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // Helper function to draw handles
  const drawHandle = (x, y) => {
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
  };

  // Draw handles at corners with offset
  drawHandle(startX + offsetX, startY + offsetY); // Top-left
  drawHandle(startX + width + offsetX, startY + offsetY); // Top-right
  drawHandle(startX + offsetX, startY + height + offsetY); // Bottom-left
  drawHandle(startX + width + offsetX, startY + height + offsetY); // Bottom-right

  return requestAnimationFrame(() => {
    drawSelectionArea(ctx, start, end, cellSize, cellPadding, gridData);
  });
} 