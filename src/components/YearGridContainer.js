import React from 'react';
import ContributionGrid from './ContributionGrid';
import { useState } from 'react';
import { TOOLS, COLORS } from './PaintTools';

const YearGridContainer = ({ year, onRemove }) => {
  const [activeTool, setActiveTool] = useState(TOOLS.PENCIL);
  const [intensity, setIntensity] = useState(1);

  const handleToolChange = (tool, newIntensity) => {
    if (tool) setActiveTool(tool);
    if (newIntensity !== undefined) {
      setIntensity(newIntensity);
    }
  };

  return (
    <div className="year-grid">
      <div className="grid-controls">
        <div className="year-number">{year}</div>
        <div className="grid-header">
          <div className="paint-tools">
            <div className="tool-buttons">
              <button 
                className={`tool-button ${activeTool === TOOLS.PENCIL ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.PENCIL)}
                title="Pencil"
              >
                <i className="fas fa-pencil-alt"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.FILL ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.FILL)}
                title="Fill"
              >
                <i className="fas fa-fill-drip"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.RECTANGLE ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.RECTANGLE)}
                title="Filled Rectangle"
              >
                <i className="fas fa-square"></i>
              </button>
              <button 
                className={`tool-button ${activeTool === TOOLS.RECTANGLE_BORDER ? 'active' : ''}`}
                onClick={() => handleToolChange(TOOLS.RECTANGLE_BORDER)}
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
                  onClick={() => handleToolChange(null, id)}
                >
                  <span className="color-preview"></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(year)}
        className="remove-year"
        title="Remove year"
      >
        ×
      </button>
      <ContributionGrid 
        year={year}
        activeTool={activeTool}
        intensity={intensity}
      />
    </div>
  );
};

export default YearGridContainer; 