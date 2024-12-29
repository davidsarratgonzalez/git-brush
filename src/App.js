import React, { useState } from 'react';
import './App.css';
import ContributionGrid from './components/ContributionGrid';
import YearControls from './components/YearControls';

function App() {
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  const addYear = () => {
    if (!years.includes(newYear)) {
      setYears([...years, newYear].sort((a, b) => b - a));
    }
  };

  const removeYear = (yearToRemove) => {
    setYears(years.filter(year => year !== yearToRemove));
  };
  
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
          {years.map(year => (
            <div key={year} className="year-grid">
              <div className="year-header">
                <h2>{year}</h2>
                <button onClick={() => removeYear(year)} className="remove-year">×</button>
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
