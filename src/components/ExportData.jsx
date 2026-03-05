// src/components/ExportData.jsx
import React, { useState, useEffect } from 'react';
import { fetchInterviews, clearAllData } from '../services/api';

function ExportData() {
  const [exportStatus, setExportStatus] = useState('');
  const [interviewScores, setInterviewScores] = useState([]);
  const [interviewChats, setInterviewChats] = useState([]);

  const loadData = async () => {
    try {
      const data = await fetchInterviews();
      setInterviewScores(data.scores || []);
      setInterviewChats(data.chats || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('historyCleared', loadData);
    return () => window.removeEventListener('historyCleared', loadData);
  }, []);

  const exportToCSV = () => {
    if (interviewScores.length === 0) {
      setExportStatus('⚠️ No interview scores to export.');
      setTimeout(() => setExportStatus(''), 3000);
      return;
    }

    // CSV Header
    const headers = ['Date', 'Clarity', 'Coherence', 'Confidence', 'Nervousness', 'Filler Words'];
    const csvRows = [headers.join(',')];

    // CSV Data
    interviewScores.forEach((score) => {
      const row = [
        new Date(score.date).toLocaleDateString(),
        score.clarity || 0,
        score.coherence || 0,
        score.confidence || 0,
        score.nervousness || 0,
        score.fillerWords || 0,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `career-sim-scores-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportStatus('✅ CSV exported successfully!');
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone!')) {
      try {
        await clearAllData();
        setInterviewScores([]);
        setInterviewChats([]);
        window.dispatchEvent(new CustomEvent('historyCleared'));
        setExportStatus('✅ All data cleared!');
        setTimeout(() => setExportStatus(''), 3000);
      } catch (err) {
        console.error('Error clearing data:', err);
        setExportStatus('❌ Failed to clear data.');
        setTimeout(() => setExportStatus(''), 3000);
      }
    }
  };

  return (
    <div className="export-data-container">
      <h2>Data Management</h2>
      <p>Export your interview history and progress data.</p>

      <div className="export-stats">
        <div className="stat-card">
          <span className="stat-number">{interviewScores.length}</span>
          <span className="stat-label">Interview Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{interviewChats.length}</span>
          <span className="stat-label">Saved Conversations</span>
        </div>
      </div>

      <div className="export-actions">
        <div className="export-section">
          <h3>Export Data</h3>
          <div className="buttons">
            <button onClick={exportToCSV} className="btn-export" disabled={interviewScores.length === 0}>
              📊 Export Scores to CSV
            </button>
          </div>
        </div>

        <div className="export-section danger-zone">
          <button onClick={handleClearAllData} className="btn-danger">
            🗑️ Clear All Data
          </button>
          <p className="warning-text">This will permanently delete all your interview history and scores.</p>
        </div>
      </div>

      {exportStatus && (
        <div className={`export-status ${exportStatus.includes('✅') ? 'success' : 'error'}`}>
          {exportStatus}
        </div>
      )}
    </div>
  );
}

export default ExportData;
