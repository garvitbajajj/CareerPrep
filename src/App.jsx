// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { logout } from './services/api';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Interview from './components/Interview';
import Writing from './components/Writing';
import Resume from './components/Resume';
import History from './components/History';
import QuestionBank from './components/QuestionBank';
import SkillsQuiz from './components/SkillsQuiz';
import DataManagementPage from './components/DataManagementPage';
import Chatbot from './components/Chatbot';

function AppContent() {
  const { user, loading } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Show a loading spinner while checking auth
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 CareerPrep</h1>
          <p className="header-tagline">Your AI-Powered Career Preparation Platform</p>
        </div>
        <div className="header-buttons">
          <div className="user-info">
            {user.avatar && (
              <img src={user.avatar} alt={user.displayName} className="user-avatar" referrerPolicy="no-referrer" />
            )}
            <span className="user-name">{user.displayName}</span>
          </div>
          <button onClick={toggleTheme} className="btn-theme-toggle" title="Toggle theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => setShowDataManagement(true)} className="btn-data-management">
            ⚙️ Data Management
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="btn-history">
            {showHistory ? '← Back to App' : '📊 Show Interview History'}
          </button>
          <button onClick={logout} className="btn-logout">
            🚪 Logout
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;