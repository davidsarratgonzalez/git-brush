import { useState, useEffect } from 'react';

const STORAGE_KEY = 'gitbrush_data';

export const useLocalStorage = () => {
  const [gridsData, setGridsData] = useState(() => {
    // Try to get initial data from localStorage
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return {};
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gridsData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [gridsData]);

  return [gridsData, setGridsData];
}; 