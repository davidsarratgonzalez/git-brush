import { useState } from "react";

/**
 * Manages the list of years and the user's input for a new year.
 */
export default function useYearList() {
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  const addYear = () => {
    if (!years.includes(newYear)) {
      setYears([...years, newYear].sort((a, b) => b - a));
    }
  };

  const removeYear = (yearToRemove) => {
    setYears(years.filter((year) => year !== yearToRemove));
  };

  return {
    years,
    setYears,
    newYear,
    setNewYear,
    addYear,
    removeYear,
  };
} 