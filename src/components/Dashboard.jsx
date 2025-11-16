// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [scores, setScores] = useState([]);
  const [averages, setAverages] = useState({ 
    clarity: 0, 
    coherence: 0, 
    fillerWords: 0,
    confidence: 0,
    nervousness: 0
  });
  const [trends, setTrends] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  const loadData = () => {
    const allScores = JSON.parse(localStorage.getItem('interviewScores')) || [];
    setScores(allScores);

    if (allScores.length > 0) {
      const totalClarity = allScores.reduce((sum, s) => sum + (s.clarity || 0), 0);
      const totalCoherence = allScores.reduce((sum, s) => sum + (s.coherence || 0), 0);
      const totalFillerWords = allScores.reduce((sum, s) => sum + (s.fillerWords || 0), 0);
      const totalConfidence = allScores.reduce((sum, s) => sum + (s.confidence || 0), 0);
      const totalNervousness = allScores.reduce((sum, s) => sum + (s.nervousness || 0), 0);
      
      const avgClarity = parseFloat((totalClarity / allScores.length).toFixed(1));
      const avgCoherence = parseFloat((totalCoherence / allScores.length).toFixed(1));
      const avgFillerWords = parseFloat((totalFillerWords / allScores.length).toFixed(1));
      const avgConfidence = parseFloat((totalConfidence / allScores.length).toFixed(1));
      const avgNervousness = parseFloat((totalNervousness / allScores.length).toFixed(1));
      
      setAverages({
        clarity: avgClarity,
        coherence: avgCoherence,
        fillerWords: avgFillerWords,
        confidence: avgConfidence,
        nervousness: avgNervousness,
      });

      // Calculate trends (comparing recent vs older scores)
      if (allScores.length >= 3) {
        const recentCount = Math.min(3, Math.floor(allScores.length / 2));
        const recentScores = allScores.slice(-recentCount);
        const olderScores = allScores.slice(0, allScores.length - recentCount);

        const recentAvg = {
          clarity: recentScores.reduce((sum, s) => sum + (s.clarity || 0), 0) / recentCount,
          coherence: recentScores.reduce((sum, s) => sum + (s.coherence || 0), 0) / recentCount,
          confidence: recentScores.reduce((sum, s) => sum + (s.confidence || 0), 0) / recentCount,
        };

        const olderAvg = {
          clarity: olderScores.reduce((sum, s) => sum + (s.clarity || 0), 0) / olderScores.length,
          coherence: olderScores.reduce((sum, s) => sum + (s.coherence || 0), 0) / olderScores.length,
          confidence: olderScores.reduce((sum, s) => sum + (s.confidence || 0), 0) / olderScores.length,
        };

        setTrends({
          clarity: recentAvg.clarity - olderAvg.clarity,
          coherence: recentAvg.coherence - olderAvg.coherence,
          confidence: recentAvg.confidence - olderAvg.confidence,
        });
      }

      // Generate intelligent suggestions (will be called after trends are set)
      const currentTrends = allScores.length >= 3 ? {
        clarity: (recentScores.reduce((sum, s) => sum + (s.clarity || 0), 0) / recentCount) - 
                 (olderScores.reduce((sum, s) => sum + (s.clarity || 0), 0) / olderScores.length),
        coherence: (recentScores.reduce((sum, s) => sum + (s.coherence || 0), 0) / recentCount) - 
                   (olderScores.reduce((sum, s) => sum + (s.coherence || 0), 0) / olderScores.length),
        confidence: (recentScores.reduce((sum, s) => sum + (s.confidence || 0), 0) / recentCount) - 
                   (olderScores.reduce((sum, s) => sum + (s.confidence || 0), 0) / olderScores.length),
      } : {};

      generateSuggestions({
        clarity: avgClarity,
        coherence: avgCoherence,
        fillerWords: avgFillerWords,
        confidence: avgConfidence,
        nervousness: avgNervousness,
        trends: currentTrends,
        totalSessions: allScores.length,
      });
    } else {
      setAverages({ clarity: 0, coherence: 0, fillerWords: 0, confidence: 0, nervousness: 0 });
      setTrends({});
      setSuggestions([]);
    }
  };

  const generateSuggestions = (data) => {
    const newSuggestions = [];
    const { clarity, coherence, fillerWords, confidence, nervousness, trends, totalSessions } = data;

    // Priority-based suggestions
    // 1. Critical issues (score < 5)
    if (clarity < 5) {
      newSuggestions.push({
        priority: 'high',
        icon: '🎯',
        title: 'Focus on Clarity',
        description: `Your clarity score is ${clarity}/10. Work on articulating your thoughts more clearly.`,
        action: 'Practice structuring answers using the STAR method (Situation, Task, Action, Result).',
        tips: [
          'Pause before speaking to organize your thoughts',
          'Use simple, direct language',
          'Practice explaining complex topics in simple terms'
        ],
        trend: trends.clarity > 0.5 ? '📈 Improving' : trends.clarity < -0.5 ? '📉 Declining' : null
      });
    }

    if (coherence < 5) {
      newSuggestions.push({
        priority: 'high',
        icon: '🧠',
        title: 'Improve Coherence',
        description: `Your coherence score is ${coherence}/10. Your answers need better structure.`,
        action: 'Before answering, mentally outline 2-3 key points you want to cover.',
        tips: [
          'Use transition words (first, second, finally)',
          'Connect ideas logically',
          'Practice telling stories with clear beginning, middle, and end'
        ],
        trend: trends.coherence > 0.5 ? '📈 Improving' : trends.coherence < -0.5 ? '📉 Declining' : null
      });
    }

    if (nervousness > 7) {
      newSuggestions.push({
        priority: 'high',
        icon: '😰',
        title: 'Reduce Nervousness',
        description: `Your nervousness level is ${nervousness}/10. High anxiety affects your performance.`,
        action: 'Practice breathing exercises and visualization techniques before interviews.',
        tips: [
          'Take deep breaths before speaking',
          'Remember: it\'s a practice session, not a real interview',
          'Focus on the message, not on being perfect'
        ]
      });
    }

    // 2. Moderate issues (score 5-7)
    if (clarity >= 5 && clarity < 7) {
      newSuggestions.push({
        priority: 'medium',
        icon: '💡',
        title: 'Enhance Clarity',
        description: `Your clarity is decent (${clarity}/10) but has room for improvement.`,
        action: 'Focus on eliminating vague phrases and being more specific.',
        tips: [
          'Replace "things" and "stuff" with specific examples',
          'Use concrete numbers and metrics when possible',
          'Practice the "elevator pitch" version of your answers'
        ],
        trend: trends.clarity > 0.3 ? '📈 Improving' : null
      });
    }

    if (fillerWords > 3) {
      newSuggestions.push({
        priority: 'medium',
        icon: '🗣️',
        title: 'Reduce Filler Words',
        description: `You're using ${fillerWords} filler words per answer on average.`,
        action: 'Practice pausing silently instead of using "um", "uh", or "like".',
        tips: [
          'Silence is better than filler words',
          'Record yourself and count filler words',
          'Practice speaking slower to give yourself time to think'
        ]
      });
    }

    if (confidence < 6) {
      newSuggestions.push({
        priority: 'medium',
        icon: '💪',
        title: 'Build Confidence',
        description: `Your confidence score is ${confidence}/10. Work on projecting more assurance.`,
        action: 'Practice speaking with conviction and avoid hedging language.',
        tips: [
          'Remove phrases like "I guess" or "maybe"',
          'Use strong, definitive statements',
          'Practice power poses before interviews'
        ],
        trend: trends.confidence > 0.3 ? '📈 Improving' : null
      });
    }

    // 3. Strengths and encouragement
    if (clarity >= 7 && coherence >= 7 && fillerWords <= 2) {
      newSuggestions.push({
        priority: 'low',
        icon: '🌟',
        title: 'Excellent Progress!',
        description: 'Your communication skills are strong. Keep up the great work!',
        action: 'Challenge yourself with advanced interview scenarios.',
        tips: [
          'Try behavioral questions about conflict',
          'Practice explaining technical concepts to non-technical audiences',
          'Work on storytelling and narrative structure'
        ]
      });
    }

    // 4. General improvement suggestions
    if (totalSessions < 3) {
      newSuggestions.push({
        priority: 'low',
        icon: '📚',
        title: 'Build Practice Routine',
        description: `You've completed ${totalSessions} interview${totalSessions === 1 ? '' : 's'}. More practice will help you improve faster.`,
        action: 'Aim for 3-5 practice sessions per week for best results.',
        tips: [
          'Practice different types of questions',
          'Review your feedback after each session',
          'Focus on one improvement area at a time'
        ]
      });
    }

    // Sort by priority (high -> medium -> low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    newSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('interviewEnded', loadData);
    window.addEventListener('historyCleared', loadData);
    return () => {
      window.removeEventListener('interviewEnded', loadData);
      window.removeEventListener('historyCleared', loadData);
    };
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('interviewScores');
    localStorage.removeItem('interviewChats');
    window.dispatchEvent(new CustomEvent('historyCleared'));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Your Feedback Dashboard</h2>
        <button onClick={handleClearHistory} className="btn-clear">
          Clear All History
        </button>
      </div>
      
      <div className="chart-container">
        <h3>Progress Over Time</h3>
        <p>Your average Clarity is: <strong>{averages.clarity}</strong> / 10</p>
        <p>Your average Coherence is: <strong>{averages.coherence}</strong> / 10</p>
        {/* --- NEW: Display average filler words --- */}
        <p className="filler-word-stat">
          Your average filler words per answer: <strong>{averages.fillerWords}</strong>
        </p>
        {/* ----------------------------------------- */}
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scores} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 10]} stroke="#eee" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#242424' }} 
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Legend />
            <Line type="monotone" dataKey="clarity" stroke="#8884d8" />
            <Line type="monotone" dataKey="coherence" stroke="#82ca9d" />
            {/* --- NEW: Add Filler Words line to chart --- */}
            <Line type="monotone" dataKey="fillerWords" name="Filler Words" stroke="#ffc658" />
            {/* --------------------------------------------- */}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="suggestions-container">
        <div className="suggestions-header">
          <h3>🎓 Adaptive Learning Suggestions</h3>
          <p className="suggestions-subtitle">Personalized recommendations based on your performance</p>
        </div>
        
        {scores.length === 0 ? (
          <div className="empty-suggestions">
            <div className="empty-icon">📊</div>
            <p>Complete your first interview to receive personalized learning suggestions!</p>
            <p className="empty-hint">We'll analyze your performance and provide actionable tips to help you improve.</p>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.length === 0 ? (
              <div className="suggestion-card positive">
                <div className="suggestion-header">
                  <span className="suggestion-icon">🌟</span>
                  <div>
                    <strong>Great Job!</strong>
                    {trends.clarity > 0 && <span className="trend-badge positive">📈 Improving</span>}
                  </div>
                </div>
                <p>Keep practicing to maintain your strong performance!</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div key={index} className={`suggestion-card ${suggestion.priority}`}>
                  <div className="suggestion-header">
                    <span className="suggestion-icon">{suggestion.icon}</span>
                    <div className="suggestion-title-group">
                      <strong>{suggestion.title}</strong>
                      {suggestion.trend && (
                        <span className={`trend-badge ${suggestion.trend.includes('📈') ? 'positive' : 'negative'}`}>
                          {suggestion.trend}
                        </span>
                      )}
                    </div>
                    <span className={`priority-badge ${suggestion.priority}`}>
                      {suggestion.priority === 'high' ? '🔴 High' : suggestion.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                    </span>
                  </div>
                  <p className="suggestion-description">{suggestion.description}</p>
                  <div className="suggestion-action">
                    <strong>💡 Action:</strong> {suggestion.action}
                  </div>
                  {suggestion.tips && suggestion.tips.length > 0 && (
                    <div className="suggestion-tips">
                      <strong>📝 Tips:</strong>
                      <ul>
                        {suggestion.tips.map((tip, tipIndex) => (
                          <li key={tipIndex}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;