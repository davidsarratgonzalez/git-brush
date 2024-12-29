import React from 'react';

const YearControls = ({ newYear, onYearChange, onAddYear }) => {
  return (
    <div className="year-controls">
      <input
        type="number"
        value={newYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        min="2008"
        max="2100"
        placeholder="Year"
      />
      <button onClick={onAddYear}>
        Add year
      </button>
    </div>
  );
};

export default YearControls; 