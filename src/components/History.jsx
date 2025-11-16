// src/components/History.jsx
import React, { useState, useEffect } from 'react';

function History() {
  const [chats, setChats] = useState([]);

  // Function to load data
  const loadHistory = () => {
    const allChats = JSON.parse(localStorage.getItem('interviewChats')) || [];
    setChats(allChats.reverse()); // Show most recent first
  };

  useEffect(() => {
    loadHistory(); // Load on mount

    // Listen for the clear event
    window.addEventListener('historyCleared', loadHistory);
    return () => window.removeEventListener('historyCleared', loadHistory);
  }, []);

  return (
    <main className="history-main">
      <h2>Interview History</h2>
      {chats.length === 0 ? (
        <p>You have no saved interview history.</p>
      ) : (
        chats.map((chat, index) => (
          <div key={index} className="history-chat-container">
            <h3>Interview #{chats.length - index}</h3>
            <div className="conversation-history">
              {chat.map((message, msgIndex) =>
                message.role !== 'system' ? (
                  <div key={msgIndex} className={`message ${message.role}`}>
                    <strong>
                      {message.role === 'assistant' ? 'Interviewer' : 'You'}:
                    </strong>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}

export default History;