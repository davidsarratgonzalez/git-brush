/**
 * Shared drawing helpers to keep ContributionGrid simpler.
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