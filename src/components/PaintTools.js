/**
 * Constants and components for paint tool functionality
 */

import React from 'react';

/**
 * Available drawing tools
 * @constant {Object}
 */
export const TOOLS = {
  PENCIL: 'PENCIL',
  FILL: 'FILL', 
  RECTANGLE: 'RECTANGLE',
  RECTANGLE_BORDER: 'RECTANGLE_BORDER',
  SELECT: 'SELECT',
  PASTE: 'PASTE'
};

/**
 * Color palette options with hover states
 * @constant {Array<Object>}
 * @property {number} id - Unique identifier for the color
 * @property {string} name - Display name of the color
 * @property {string} color - Hex code for the color
 * @property {string} hoverColor - Hex code for hover state
 */
const COLORS = [
  { id: 0, name: 'None', color: '#ebedf0', hoverColor: '#dfe1e4' },
  { id: 1, name: 'Light', color: '#9be9a8', hoverColor: '#8cd89c' },
  { id: 2, name: 'Medium', color: '#40c463', hoverColor: '#3ab558' },
  { id: 3, name: 'Dark', color: '#30a14e', hoverColor: '#2c9447' },
  { id: 4, name: 'Darker', color: '#216e39', hoverColor: '#1d6333' }
];

/**
 * Paint tools component providing drawing tool selection and color palette
 * @component
 * @param {Object} props
 * @param {string} props.activeTool - Currently selected drawing tool
 * @param {Function} props.onToolChange - Callback when tool selection changes
 * @param {number} props.intensity - Selected color intensity level (0-4)
 * @param {Function} props.onIntensityChange - Callback when color intensity changes
 */
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