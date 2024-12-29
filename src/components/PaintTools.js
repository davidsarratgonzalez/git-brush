import React from 'react';

export const TOOLS = {
  PENCIL: 'PENCIL',
  FILL: 'FILL',
  RECTANGLE: 'RECTANGLE',
  RECTANGLE_BORDER: 'RECTANGLE_BORDER',
  SELECT: 'SELECT',
  PASTE: 'PASTE'
};

const COLORS = [
  { id: 0, name: 'None', color: '#ebedf0', hoverColor: '#dfe1e4' },
  { id: 1, name: 'Light', color: '#9be9a8', hoverColor: '#8cd89c' },
  { id: 2, name: 'Medium', color: '#40c463', hoverColor: '#3ab558' },
  { id: 3, name: 'Dark', color: '#30a14e', hoverColor: '#2c9447' },
  { id: 4, name: 'Darker', color: '#216e39', hoverColor: '#1d6333' }
];

const PaintTools = ({ activeTool, onToolChange, intensity, onIntensityChange }) => {
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
      </div>
      <div className="color-palette">
        {COLORS.map(({ id, name, color, hoverColor }) => (
          <button
            key={id}
            className={`color-button ${intensity === id ? 'active' : ''}`}
            style={{ 
              '--color': color,
              '--hover-color': hoverColor
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

export default PaintTools;
export { COLORS }; 