import { useState, useCallback } from 'react';

export const useHistory = (initialState) => {
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState([JSON.parse(JSON.stringify(initialState))]);

  const canUndo = current > 0;
  const canRedo = current < history.length - 1;

  const push = useCallback((newState) => {
    // Only push if state is different
    if (JSON.stringify(newState) !== JSON.stringify(history[current])) {
      const newHistory = history.slice(0, current + 1);
      setHistory([...newHistory, JSON.parse(JSON.stringify(newState))]);
      setCurrent(current + 1);
    }
  }, [current, history]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrent(current - 1);
      return JSON.parse(JSON.stringify(history[current - 1]));
    }
    return null;
  }, [canUndo, current, history]);

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