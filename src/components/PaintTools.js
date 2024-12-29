import React from 'react';

const PaintTools = ({ activeTool, onToolChange, intensity, onIntensityChange }) => {
  const COLORS = [
    { id: 0, name: 'None', color: '#ebedf0' },
    { id: 1, name: 'Light', color: '#9be9a8' },
    { id: 2, name: 'Medium', color: '#40c463' },
    { id: 3, name: 'Dark', color: '#30a14e' },
    { id: 4, name: 'Darker', color: '#216e39' }
  ];

  return (
    <div className="paint-tools">
      <div className="tool-buttons">
        <button 
          className={`tool-button ${activeTool === TOOLS.PENCIL ? 'active' : ''}`}
          onClick={() => onToolChange(TOOLS.PENCIL)}
          title="Pencil"
        >
          <i className="fas fa-pencil-alt"></i>
        </button>
        <button 
          className={`tool-button ${activeTool === TOOLS.FILL ? 'active' : ''}`}
          onClick={() => onToolChange(TOOLS.FILL)}
          title="Fill"
        >
          <i className="fas fa-fill-drip"></i>
        </button>
        <button 
          className={`tool-button ${activeTool === TOOLS.RECTANGLE ? 'active' : ''}`}
          onClick={() => onToolChange(TOOLS.RECTANGLE)}
          title="Filled Rectangle"
        >
          <i className="fas fa-square"></i>
        </button>
        <button 
          className={`tool-button ${activeTool === TOOLS.RECTANGLE_BORDER ? 'active' : ''}`}
          onClick={() => onToolChange(TOOLS.RECTANGLE_BORDER)}
          title="Rectangle Border"
        >
          <i className="far fa-square"></i>
        </button>
        <button 
          className={`tool-button ${activeTool === TOOLS.SELECT ? 'active' : ''}`}
          onClick={() => onToolChange(TOOLS.SELECT)}
          title="Select Area"
        >
          <i className="fas fa-vector-square"></i>
        </button>
      </div>
      <div className="color-palette">
        {COLORS.map(({ id, name, color }) => (
          <button
            key={id}
            className={`color-button ${intensity === id ? 'active' : ''}`}
            style={{ 
              '--color': color,
              '--hover-color': color,
              '--active-color': color 
            }}
            title={name}
            onClick={() => onIntensityChange(id)}
          >
            <span className="color-preview"></span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const TOOLS = {
  PENCIL: 'pencil',
  FILL: 'fill',
  RECTANGLE: 'rectangle',
  RECTANGLE_BORDER: 'rectangle_border',
  SELECT: 'select'
};

export default PaintTools; 