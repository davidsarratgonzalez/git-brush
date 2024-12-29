class SelectionManager {
  constructor() {
    this.currentSelection = null;
    this.onSelectionChange = null;
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

  subscribe(callback) {
    this.onSelectionChange = callback;
    return () => {
      this.onSelectionChange = null;
    };
  }
}

// Create singleton instance
export const selectionManager = new SelectionManager(); 