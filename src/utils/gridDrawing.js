/**
 * Utility functions for drawing and initializing contribution grids
 */

/**
 * Draws an empty contribution grid on a canvas context
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context to draw on
 * @param {Array<Array<number|null>>} data - 2D array of grid cell data
 * @param {number} cellSize - Width/height of each grid cell in pixels
 * @param {number} cellPadding - Padding between cells in pixels
 * @param {string[]} gridColors - Array of colors for different contribution levels
 */
export function drawEmptyGrid(ctx, data, cellSize, cellPadding, gridColors) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const x = colIndex * (cellSize + cellPadding);
      const y = rowIndex * (cellSize + cellPadding);

      if (cell === null) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = gridColors[cell];
      }
      ctx.fillRect(x, y, cellSize, cellSize);
    });
  });
}

/**
 * Initializes an empty contribution grid data structure for a given year
 *
 * @param {Function} isValidDay - Function that determines if a grid position represents a valid day
 * @param {number} year - Year to create grid for
 * @param {Function} getDaysInYear - Function that returns number of days in the year
 * @param {Function} getFirstDayOfYear - Function that returns first day of week (0-6) for the year
 * @returns {Array<Array<number|null>>} 2D array representing the initialized grid
 */
export function initializeGridData(
  isValidDay,
  year,
  getDaysInYear,
  getFirstDayOfYear
) {
  const firstDay = getFirstDayOfYear(year);
  const totalDays = getDaysInYear(year);
  const totalWeeks = Math.ceil((totalDays + firstDay) / 7);

  const grid = Array(7)
    .fill(null)
    .map(() => Array(totalWeeks).fill(null));

  for (let col = 0; col < totalWeeks; col++) {
    for (let row = 0; row < 7; row++) {
      if (isValidDay(row, col)) {
        grid[row][col] = 0;
      }
    }
  }
  return grid;
} 