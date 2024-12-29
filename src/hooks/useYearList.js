import { useState } from "react";

/**
 * Custom hook for managing a list of years and new year input
 * 
 * @returns {Object} Year list management utilities
 * @property {number[]} years - Array of years currently in the list
 * @property {Function} setYears - Function to directly update years array
 * @property {number} newYear - Currently entered new year value
 * @property {Function} setNewYear - Function to update new year value
 * @property {Function} addYear - Adds current newYear to list if not already present
 * @property {Function} removeYear - Removes specified year from the list
 */
export default function useYearList() {
  // Track list of years and new year input
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  /**
   * Adds the current newYear value to the years list if not already present
   * Years are maintained in descending order
   */
  const addYear = () => {
    if (!years.includes(newYear)) {
      setYears([...years, newYear].sort((a, b) => b - a));
    }
  };

  /**
   * Removes specified year from the years list
   * @param {number} yearToRemove - Year to remove from list
   */
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