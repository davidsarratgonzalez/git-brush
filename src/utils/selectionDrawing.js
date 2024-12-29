/**
 * Draws a selection area rectangle with corner handles on the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context to draw on
 * @param {Object} start - Starting coordinates {row, col} of selection
 * @param {Object} end - Ending coordinates {row, col} of selection
 * @param {number} cellSize - Width/height of each cell in pixels
 * @param {number} cellPadding - Padding between cells in pixels
 * @param {Array<Array<number|null>>} gridData - 2D array of grid cell data
 */
export function drawSelectionArea(
  ctx,
  start,
  end,
  cellSize,
  cellPadding,
  gridData
) {
  if (!start || !end) return;

  // Clear any existing drawings
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Calculate rectangle boundaries
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  // Convert grid coordinates to pixel positions
  const startX = minCol * (cellSize + cellPadding);
  const startY = minRow * (cellSize + cellPadding);
  const width = (maxCol - minCol + 1) * (cellSize + cellPadding) - cellPadding;
  const height = (maxRow - minRow + 1) * (cellSize + cellPadding) - cellPadding;

  // Standard padding for selection area
  const SELECTION_PADDING = 4;
  const offsetX = SELECTION_PADDING;
  const offsetY = SELECTION_PADDING;

  // Configure and draw dashed selection rectangle
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  
  ctx.strokeRect(
    startX + offsetX,
    startY + offsetY,
    width,
    height
  );

  // Configure corner handle styles
  const handleSize = 6;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  /**
   * Draws a square handle centered at the given coordinates
   * @param {number} x - X coordinate of handle center
   * @param {number} y - Y coordinate of handle center
   */
  const drawHandle = (x, y) => {
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
  };

  // Draw corner handles
  drawHandle(startX + offsetX, startY + offsetY);
  drawHandle(startX + width + offsetX, startY + offsetY);
  drawHandle(startX + offsetX, startY + height + offsetY);
  drawHandle(startX + width + offsetX, startY + height + offsetY);
} 