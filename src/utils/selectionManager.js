/**
 * Manages selection state and operations for grid cells
 * Handles copying, cutting, and tracking of selected regions
 */
class SelectionManager {
  /**
   * Creates a new SelectionManager instance
   */
  constructor() {
    /** Currently active selection */
    this.currentSelection = null;

    /** Callback for selection changes */
    this.onSelectionChange = null;

    /** Currently copied grid data */
    this.copiedData = null;

    /** Callback for copied data changes */
    this.onCopiedDataChange = null;
  }

  /**
   * Updates the current selection
   * @param {Object} selection - New selection object containing coordinates and clear function
   */
  setSelection(selection) {
    if (this.currentSelection && 
        this.currentSelection.gridId !== selection?.gridId) {
      this.currentSelection.clearFn();
    }
    
    this.currentSelection = selection;
    
    if (this.onSelectionChange) {
      this.onSelectionChange(selection);
    }
  }

  /**
   * Clears the current selection
   */
  clearSelection() {
    if (this.currentSelection) {
      this.currentSelection.clearFn();
      this.currentSelection = null;
      
      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
    }
  }

  /**
   * Copies the currently selected grid cells
   * @param {Array<Array<number|null>>} gridData - 2D array of grid cell data
   */
  copySelection(gridData) {
    if (!this.currentSelection) return;
    
    const { startRow, startCol, endRow, endCol } = this.getSelectionBounds();
    
    const copiedArea = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startCol; c <= endCol; c++) {
        const cell = gridData[r][c];
        row.push(cell !== null ? cell : null);
      }
      copiedArea.push(row);
    }
    
    this.copiedData = {
      data: copiedArea,
      width: endCol - startCol + 1,
      height: endRow - startRow + 1
    };

    if (this.onCopiedDataChange) {
      this.onCopiedDataChange(true);
    }
  }

  /**
   * Cuts (copies and clears) the currently selected grid cells
   * @param {Array<Array<number|null>>} gridData - 2D array of grid cell data
   * @param {Function} setGridData - Function to update grid data
   */
  cutSelection(gridData, setGridData) {
    if (!this.currentSelection) return;
    
    this.copySelection(gridData);
    
    const { startRow, startCol, endRow, endCol } = this.getSelectionBounds();
    const newGrid = [...gridData];
    
    for (let r = startRow; r <= endRow; r++) {
      newGrid[r] = [...gridData[r]];
      for (let c = startCol; c <= endCol; c++) {
        if (newGrid[r][c] !== null) {
          newGrid[r][c] = 0;
        }
      }
    }
    
    setGridData(newGrid);
  }

  /**
   * Gets the bounding coordinates of the current selection
   * @returns {Object} Object containing start/end row/column indices
   */
  getSelectionBounds() {
    const start = this.currentSelection.startCoords;
    const end = this.currentSelection.endCoords;
    
    return {
      startRow: Math.min(start.row, end.row),
      endRow: Math.max(start.row, end.row),
      startCol: Math.min(start.col, end.col),
      endCol: Math.max(start.col, end.col)
    };
  }

  /**
   * Checks if there is copied data available
   * @returns {boolean} True if copied data exists
   */
  hasCopiedData() {
    return this.copiedData !== null;
  }

  /**
   * Checks if there is an active selection
   * @returns {boolean} True if selection exists
   */
  hasSelection() {
    return this.currentSelection !== null;
  }

  /**
   * Subscribes to selection changes
   * @param {Function} callback - Function to call on selection changes
   * @returns {Function} Cleanup function to unsubscribe
   */
  subscribe(callback) {
    this.onSelectionChange = callback;
    return () => {
      this.onSelectionChange = null;
    };
  }

  /**
   * Clears the currently copied data
   */
  clearCopiedData() {
    this.copiedData = null;
    if (this.onCopiedDataChange) {
      this.onCopiedDataChange(false);
    }
  }

  /**
   * Subscribes to copied data changes
   * @param {Function} callback - Function to call when copied data changes
   * @returns {Function} Cleanup function to unsubscribe
   */
  subscribeToCopiedData(callback) {
    this.onCopiedDataChange = callback;
    return () => {
      this.onCopiedDataChange = null;
    };
  }
}

// Create singleton instance
export const selectionManager = new SelectionManager();