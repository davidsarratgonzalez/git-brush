/**
 * Draws a single cell in the contribution grid with the specified intensity
 * 
 * @param {Object} coords - Row and column coordinates of cell to draw
 * @param {Array<Array<number>>} gridData - 2D array of current grid data
 * @param {Function} setGridData - Function to update grid data
 * @param {number} intensity - Color intensity level to draw (0-4)
 * @param {React.RefObject} canvasRef - Reference to canvas element
 * @param {number} cellSize - Size of each cell in pixels
 * @param {number} cellPadding - Padding between cells in pixels
 * @param {string[]} gridColors - Array of colors for different intensities
 */
export function drawCell(coords, gridData, setGridData, intensity, canvasRef, cellSize, cellPadding, gridColors) {
  if (!coords || !gridData[coords.row] || gridData[coords.row][coords.col] === null) return;

  const newGridData = [...gridData];
  newGridData[coords.row][coords.col] = intensity;
  setGridData(newGridData);

  const ctx = canvasRef.current.getContext('2d');
  const x = coords.col * (cellSize + cellPadding);
  const y = coords.row * (cellSize + cellPadding);

  ctx.fillStyle = gridColors[intensity];
  ctx.fillRect(x, y, cellSize, cellSize);
}

/**
 * Fills a connected area of cells with the same intensity value
 * Uses flood fill algorithm to recursively fill adjacent cells
 * 
 * @param {Object} coords - Row and column coordinates of starting cell
 * @param {Array<Array<number>>} gridData - 2D array of current grid data
 * @param {Function} setGridData - Function to update grid data
 * @param {number} intensity - Color intensity level to fill with (0-4)
 * @param {React.RefObject} canvasRef - Reference to canvas element
 * @param {number} cellSize - Size of each cell in pixels
 * @param {number} cellPadding - Padding between cells in pixels
 * @param {string[]} gridColors - Array of colors for different intensities
 */
export function fillArea(coords, gridData, setGridData, intensity, canvasRef, cellSize, cellPadding, gridColors) {
  if (!coords || !gridData[coords.row] || gridData[coords.row][coords.col] === null) return;

  const targetIntensity = gridData[coords.row][coords.col];
  if (targetIntensity === intensity) return;

  const newGridData = [...gridData];
  const ctx = canvasRef.current.getContext('2d');

  const fill = (r, c) => {
    if (
      r < 0 ||
      r >= 7 ||
      c < 0 ||
      c >= gridData[0].length ||
      newGridData[r][c] !== targetIntensity ||
      newGridData[r][c] === null
    ) {
      return;
    }

    newGridData[r][c] = intensity;

    const x = c * (cellSize + cellPadding);
    const y = r * (cellSize + cellPadding);
    ctx.fillStyle = gridColors[intensity];
    ctx.fillRect(x, y, cellSize, cellSize);

    fill(r + 1, c);
    fill(r - 1, c);
    fill(r, c + 1);
    fill(r, c - 1);
  };

  fill(coords.row, coords.col);
  setGridData(newGridData);
} 