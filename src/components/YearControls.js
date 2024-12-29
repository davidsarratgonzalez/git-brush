/**
 * YearControls Component
 * 
 * Provides UI controls for adding and managing contribution grid years.
 * Includes a number input for selecting the year and an add button.
 */

import React from 'react';

/**
 * @component
 * @param {Object} props
 * @param {number} props.newYear - Currently selected year value
 * @param {Function} props.onYearChange - Callback when year input changes
 * @param {Function} props.onAddYear - Callback when Add Year button is clicked
 */
const YearControls = ({ newYear, onYearChange, onAddYear }) => {
  return (
    <div className="year-controls">
      <input
        type="number"
        value={newYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        min="1"
        placeholder="Year"
      />
      <button onClick={onAddYear}>
        Add year
      </button>
    </div>
  );
};

export default YearControls;