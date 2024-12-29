class SelectionManager {
  constructor() {
    this.currentSelection = null;
    this.onSelectionChange = null;
    this.copiedData = null;
    this.onCopiedDataChange = null;
  }

  setSelection(selection) {
    // Clear previous selection if it exists and is different
    if (this.currentSelection && 
        this.currentSelection.gridId !== selection?.gridId) {
      this.currentSelection.clearFn();
    }
    
    this.currentSelection = selection;
    
    if (this.onSelectionChange) {
      this.onSelectionChange(selection);
    }
  }

  clearSelection() {
    if (this.currentSelection) {
      this.currentSelection.clearFn();
      this.currentSelection = null;
      
      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
    }
  }

  copySelection(gridData) {
    if (!this.currentSelection) return;
    
    const { startRow, startCol, endRow, endCol } = this.getSelectionBounds();
    
    // Create a copy of the selected area
    const copiedArea = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startCol; c <= endCol; c++) {
        // Only copy non-null cells (including empty/gray ones)
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

    // Notify listeners that copied data changed
    if (this.onCopiedDataChange) {
      this.onCopiedDataChange(true);
    }
  }

  cutSelection(gridData, setGridData) {
    if (!this.currentSelection) return;
    
    // Copy first (reuse the copy functionality)
    this.copySelection(gridData);
    
    // Then clear the selected area
    const { startRow, startCol, endRow, endCol } = this.getSelectionBounds();
    const newGrid = [...gridData];
    
    for (let r = startRow; r <= endRow; r++) {
      newGrid[r] = [...gridData[r]];
      for (let c = startCol; c <= endCol; c++) {
        if (newGrid[r][c] !== null) {
          newGrid[r][c] = 0; // Set to empty (0) only if it's not a null cell
        }
      }
    }
    
    setGridData(newGrid);
  }

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

  hasCopiedData() {
    return this.copiedData !== null;
  }

  hasSelection() {
    return this.currentSelection !== null;
  }

  subscribe(callback) {
    this.onSelectionChange = callback;
    return () => {
      this.onSelectionChange = null;
    };
  }

  clearCopiedData() {
    this.copiedData = null;
    if (this.onCopiedDataChange) {
      this.onCopiedDataChange(false);
    }
  }

  subscribeToCopiedData(callback) {
    this.onCopiedDataChange = callback;
    return () => {
      this.onCopiedDataChange = null;
    };
  }
}

// Create singleton instance
export const selectionManager = new SelectionManager(); 