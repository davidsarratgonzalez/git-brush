import { useState, useCallback } from 'react';

/**
 * Custom hook that provides undo/redo history functionality
 * 
 * @param {any} initialState - Initial state to start history with
 * @returns {Object} History management utilities
 * @property {any} state - Current state in history
 * @property {Function} push - Add new state to history
 * @property {Function} undo - Revert to previous state
 * @property {Function} redo - Advance to next state
 * @property {boolean} canUndo - Whether undo is available
 * @property {boolean} canRedo - Whether redo is available
 */
export const useHistory = (initialState) => {
  // Track current position in history
  const [current, setCurrent] = useState(0);
  
  // Store history of states
  const [history, setHistory] = useState([JSON.parse(JSON.stringify(initialState))]);

  // Determine if undo/redo are available
  const canUndo = current > 0;
  const canRedo = current < history.length - 1;

  /**
   * Add new state to history, truncating any future states
   * @param {any} newState - State to add to history
   */
  const push = useCallback((newState) => {
    if (JSON.stringify(newState) !== JSON.stringify(history[current])) {
      const newHistory = history.slice(0, current + 1);
      setHistory([...newHistory, JSON.parse(JSON.stringify(newState))]);
      setCurrent(current + 1);
    }
  }, [current, history]);

  /**
   * Move back one step in history
   * @returns {any|null} Previous state or null if cannot undo
   */
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrent(current - 1);
      return JSON.parse(JSON.stringify(history[current - 1]));
    }
    return null;
  }, [canUndo, current, history]);

  /**
   * Move forward one step in history
   * @returns {any|null} Next state or null if cannot redo
   */
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrent(current + 1);
      return JSON.parse(JSON.stringify(history[current + 1]));
    }
    return null;
  }, [canRedo, current, history]);

  return {
    state: history[current],
    push,
    undo,
    redo, 
    canUndo,
    canRedo
  };
};