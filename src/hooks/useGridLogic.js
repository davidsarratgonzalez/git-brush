import { useMemo, useCallback } from 'react';

/**
 * Houses shared logic for grid-based operations:
 *  - Leap years
 *  - Calendar days
 */
export default function useGridLogic(year) {
  const isLeapYear = useCallback((y) => {
    return y % 400 === 0 || (y % 100 !== 0 && y % 4 === 0);
  }, []);

  const getFirstDayOfYear = useCallback((y) => {
    return new Date(y, 0, 1).getDay();
  }, []);

  const getDaysInYear = useCallback((y) => {
    return isLeapYear(y) ? 366 : 365;
  }, [isLeapYear]);

  const calendarInfo = useMemo(() => {
    return {
      firstDay: getFirstDayOfYear(year),
      totalDays: getDaysInYear(year),
    };
  }, [getFirstDayOfYear, getDaysInYear, year]);

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