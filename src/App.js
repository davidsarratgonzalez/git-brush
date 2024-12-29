import React from 'react';
import './App.css';
import YearGridContainer from './components/YearGridContainer';
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
        <div className="header-content">
          <h1>git brush</h1>
          <YearControls 
            newYear={newYear}
            onYearChange={setNewYear}
            onAddYear={addYear}
          />
        </div>
      </header>
      <main>
        <div className="grids-container">
          {years.map((year) => (
            <YearGridContainer
              key={year}
              year={year}
              onRemove={removeYear}
            />
          ))}
        </div>
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <a 
            href="https://davidsarratgonzalez.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Made with 💚 by David Sarrat González
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
