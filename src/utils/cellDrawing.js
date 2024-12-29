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