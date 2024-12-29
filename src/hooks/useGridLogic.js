import { useMemo, useCallback } from 'react';

/**
 * Custom hook that provides calendar grid calculation utilities
 * 
 * @param {number} year - The year to perform calculations for
 * @returns {Object} Calendar grid utilities
 * @property {Object} calendarInfo - Calendar metadata for the year
 * @property {number} calendarInfo.firstDay - First day of week (0-6) the year starts on
 * @property {number} calendarInfo.totalDays - Total number of days in the year
 * @property {Function} isValidDay - Function to check if a grid position represents a valid calendar day
 */
export default function useGridLogic(year) {
  /**
   * Determines if a given year is a leap year
   * @param {number} y - Year to check
   * @returns {boolean} True if leap year, false otherwise
   */
  const isLeapYear = useCallback((y) => {
    return y % 400 === 0 || (y % 100 !== 0 && y % 4 === 0);
  }, []);

  /**
   * Gets the day of week (0-6) that a year starts on
   * @param {number} y - Year to check
   * @returns {number} Day of week index (0 = Sunday)
   */
  const getFirstDayOfYear = useCallback((y) => {
    return new Date(y, 0, 1).getDay();
  }, []);

  /**
   * Gets the total number of days in a year
   * @param {number} y - Year to check
   * @returns {number} Number of days (365 or 366)
   */
  const getDaysInYear = useCallback((y) => {
    return isLeapYear(y) ? 366 : 365;
  }, [isLeapYear]);

  /**
   * Memoized calendar metadata for the current year
   */
  const calendarInfo = useMemo(() => {
    return {
      firstDay: getFirstDayOfYear(year),
      totalDays: getDaysInYear(year),
    };
  }, [getFirstDayOfYear, getDaysInYear, year]);

  /**
   * Checks if a grid position represents a valid calendar day
   * @param {number} row - Grid row index
   * @param {number} col - Grid column index
   * @returns {boolean} True if position is a valid day, false otherwise
   */
  const isValidDay = useCallback(
    (row, col) => {
      const { firstDay, totalDays } = calendarInfo;
      const dayNumber = col * 7 + row - firstDay;
      return dayNumber >= 0 && dayNumber < totalDays;
    },
    [calendarInfo]
  );

  return {
    calendarInfo,
    isValidDay,
  };
}