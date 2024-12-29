import { useState, useEffect } from 'react';

/** Key used for storing data in localStorage */
const STORAGE_KEY = 'gitbrush_data';

/**
 * Custom hook for managing persistent data in localStorage
 * 
 * @returns {[Object, Function]} Tuple containing:
 *   - Current data stored in localStorage
 *   - Function to update the stored data
 */
export const useLocalStorage = () => {
  const [gridsData, setGridsData] = useState(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gridsData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [gridsData]);

  return [gridsData, setGridsData];
}; 