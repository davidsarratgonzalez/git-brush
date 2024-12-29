/**
 * Creates a Date object in New York timezone
 * @param {number} year - Full year
 * @param {number} month - Month index (0-11)
 * @param {number} day - Day of month (1-31)
 * @returns {Date} Date object in NY timezone
 */
const getDateInNY = (year, month, day) => {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00-05:00`;
  return new Date(dateStr);
};

/**
 * Formats grid data into a contributions object mapping dates to intensities
 * @param {number[]} years - Array of years to process
 * @param {Object} gridsData - Grid data for each year
 * @returns {Object} Map of dates (YYYY-MM-DD) to intensity values (1-4)
 */
export const formatGridDataForExport = (years, gridsData) => {
  const contributions = {};
  
  years.forEach(year => {
    const yearData = gridsData[year];
    if (!yearData) return;

    yearData.forEach((row, rowIndex) => {
      row.forEach((intensity, colIndex) => {
        if (!intensity || intensity === 0) return;

        const date = calculateDateFromCell(year, rowIndex, colIndex);
        if (date) {
          contributions[date] = intensity;
        }
      });
    });
  });

  return contributions;
};

/**
 * Calculates calendar date from grid cell position
 * @param {number} year - Year to calculate for
 * @param {number} row - Row index in grid (0-6)
 * @param {number} col - Column index in grid
 * @returns {string|null} Date string (YYYY-MM-DD) or null if invalid
 */
export const calculateDateFromCell = (year, row, col) => {
  const firstDate = getDateInNY(year, 0, 1);
  const firstDay = firstDate.getDay();
  
  const dayNumber = col * 7 + row - firstDay;
  
  const date = new Date(firstDate);
  date.setDate(firstDate.getDate() + dayNumber);
  
  if (date.getFullYear() !== year) return null;
  
  return date.toISOString().slice(0, 10);
};

/**
 * Parses imported contributions data into grid format
 * @param {Object} contributions - Map of dates to intensity values
 * @returns {Object|null} Grid data by year or null if invalid input
 */
export const parseImportedData = (contributions) => {
  if (typeof contributions !== 'object') return null;

  const yearGrids = {};
  
  Object.entries(contributions).forEach(([dateStr, intensity]) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = getDateInNY(y, m - 1, d);
    const year = date.getFullYear();
    
    if (!yearGrids[year]) {
      yearGrids[year] = initializeYearGrid(year);
    }

    const firstDate = getDateInNY(year, 0, 1);
    const firstDay = firstDate.getDay();

    const startOfYear = getDateInNY(year, 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    
    const col = Math.floor((dayOfYear + firstDay) / 7);
    const row = (dayOfYear + firstDay) % 7;

    if (yearGrids[year][row] && col >= 0 && col < yearGrids[year][row].length) {
      yearGrids[year][row][col] = intensity;
    }
  });

  return yearGrids;
};

/**
 * Initializes an empty grid for a given year
 * @param {number} year - Year to create grid for
 * @returns {Array<Array<number|null>>} 2D array representing the year's grid
 */
export const initializeYearGrid = (year) => {
  const firstDate = getDateInNY(year, 0, 1);
  const firstDay = firstDate.getDay();
  
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  const totalDays = isLeapYear ? 366 : 365;
  
  const totalWeeks = Math.ceil((totalDays + firstDay) / 7) + 1;

  const grid = Array(7).fill(null).map(() => Array(totalWeeks).fill(null));
  
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