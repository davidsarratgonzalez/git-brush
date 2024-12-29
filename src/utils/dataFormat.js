// Helper to get date in NY timezone
const getDateInNY = (year, month, day) => {
  // Create date string in NY timezone
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00-05:00`;
  return new Date(dateStr);
};

export const formatGridDataForExport = (years, gridsData) => {
  const contributions = {};
  
  // For each year in the canvas
  years.forEach(year => {
    const yearData = gridsData[year];
    if (!yearData) return;

    // For each cell in the grid
    yearData.forEach((row, rowIndex) => {
      row.forEach((intensity, colIndex) => {
        // Only save cells that have color (1-4)
        if (!intensity || intensity === 0) return;

        const date = calculateDateFromCell(year, rowIndex, colIndex);
        if (date) {
          contributions[date] = intensity;
        }
      });
    });
  });

  return contributions;  // Just return the date:intensity pairs
};

export const calculateDateFromCell = (year, row, col) => {
  // Get first day of year in NY timezone
  const firstDate = getDateInNY(year, 0, 1);
  const firstDay = firstDate.getDay();
  
  // Calculate the day number (0-based)
  const dayNumber = col * 7 + row - firstDay;
  
  // Create new date by adding days
  const date = new Date(firstDate);
  date.setDate(firstDate.getDate() + dayNumber);
  
  // Check if we're still in the right year
  if (date.getFullYear() !== year) return null;
  
  // Format as YYYY-MM-DD
  return date.toISOString().slice(0, 10);
};

export const parseImportedData = (contributions) => {
  if (typeof contributions !== 'object') return null;

  const yearGrids = {};
  
  Object.entries(contributions).forEach(([dateStr, intensity]) => {
    // Parse the date in NY timezone
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = getDateInNY(y, m - 1, d);
    const year = date.getFullYear();
    
    // Initialize grid if needed
    if (!yearGrids[year]) {
      yearGrids[year] = initializeYearGrid(year);
    }

    // Get first day of year for calculations
    const firstDate = getDateInNY(year, 0, 1);
    const firstDay = firstDate.getDay();

    // Calculate days since start of year
    const startOfYear = getDateInNY(year, 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    
    // Calculate grid position
    const col = Math.floor((dayOfYear + firstDay) / 7);
    const row = (dayOfYear + firstDay) % 7;

    // Update grid
    if (yearGrids[year][row] && col >= 0 && col < yearGrids[year][row].length) {
      yearGrids[year][row][col] = intensity;
    }
  });

  return yearGrids;
};

export const initializeYearGrid = (year) => {
  // Get first day in NY timezone
  const firstDate = getDateInNY(year, 0, 1);
  const firstDay = firstDate.getDay();
  
  // Calculate total days including the partial weeks
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  const totalDays = isLeapYear ? 366 : 365;
  
  // Add extra week to ensure we capture all days
  const totalWeeks = Math.ceil((totalDays + firstDay) / 7) + 1;

  // Initialize grid with nulls for invalid days
  const grid = Array(7).fill(null).map(() => Array(totalWeeks).fill(null));
  
  // Fill valid days with 0
  for (let col = 0; col < totalWeeks; col++) {
    for (let row = 0; row < 7; row++) {
      const date = calculateDateFromCell(year, row, col);
      if (date) {
        grid[row][col] = 0;
      }
    }
  }

  return grid;
}; 