import React from 'react';
import './App.css';
import ContributionGrid from './components/ContributionGrid';
import YearControls from './components/YearControls';
import useYearList from './hooks/useYearList';

function App() {
  const {
    years,
    newYear,
    setNewYear,
    addYear,
    removeYear
  } = useYearList();

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Contribution Graph Painter</h1>
      </header>
      <main>
        <YearControls
          newYear={newYear}
          onYearChange={setNewYear}
          onAddYear={addYear}
        />
        <div className="grids-container">
          {years.map((year) => (
            <div key={year} className="year-grid">
              <div className="year-header">
                <h2>{year}</h2>
                <button
                  onClick={() => removeYear(year)}
                  className="remove-year"
                >
                  ×
                </button>
              </div>
              <ContributionGrid year={year} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
