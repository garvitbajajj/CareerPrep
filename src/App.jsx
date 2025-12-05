// src/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Interview from './components/Interview';
import Writing from './components/Writing';
import Resume from './components/Resume';
import History from './components/History';
import QuestionBank from './components/QuestionBank';
import SkillsQuiz from './components/SkillsQuiz';
import DataManagementPage from './components/DataManagementPage';
import Chatbot from './components/Chatbot';

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';
    // Apply theme immediately on mount
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  });

  useEffect(() => {
    // Apply theme to document root whenever it changes
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 CareerPrep</h1>
          <p className="header-tagline">Your AI-Powered Career Preparation Platform</p>
        </div>
        <div className="header-buttons">
          <button onClick={toggleTheme} className="btn-theme-toggle" title="Toggle theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => setShowDataManagement(true)} className="btn-data-management">
            ⚙️ Data Management
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="btn-history">
            {showHistory ? '← Back to App' : '📊 Show Interview History'}
          </button>
        </div>
      </header>

      {showDataManagement ? (
        <DataManagementPage onClose={() => setShowDataManagement(false)} />
      ) : showHistory ? (
        <History />
      ) : (
        <main>
          <Resume />
          <div className="features-grid">
            <Interview />
            <Writing />
          </div>
          <div className="features-grid">
            <QuestionBank />
            <SkillsQuiz />
          </div>
          <Dashboard />
        </main>
      )}
      
      {/* Chatbot - Always available */}
      <Chatbot />
    </>
  );
}

export default App;