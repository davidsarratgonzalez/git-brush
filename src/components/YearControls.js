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
      />
      <button onClick={onAddYear}>Add Year</button>
    </div>
  );
};

export default YearControls; 