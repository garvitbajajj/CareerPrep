// src/components/Writing.jsx
import React, { useState } from 'react';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

function Writing() {
  const [inputText, setInputText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // --- NEW: State for the tone ---
  const [tone, setTone] = useState('Professional');
  // -------------------------------

  // --- UPDATED: handleImproveText ---
  const handleImproveText = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setImprovedText('');

    // The prompt now includes the selected tone
    const systemPrompt = `You are an expert career coach and copyeditor.
      Rewrite the following text to be more effective for a job application.
      
      The user's desired tone is: **${tone}**.
      
      After rewriting it, add a section at the bottom starting with "--- \n **Key Improvements:**" followed by a bulleted list of the specific changes you made and why.`;

    try {
      const reply = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inputText },
        ],
        model: 'llama-3.1-8b-instant',
      });
      setImprovedText(reply.choices[0].message.content);
    } catch (error) {
      console.error('Error with Groq API:', error);
      setImprovedText('Sorry, an error occurred. Please try again.');
    }
    setIsLoading(false);
  };
  // ----------------------------------

  const handleClearText = () => {
    setInputText('');
    setImprovedText('');
  };

  return (
    <div className="writing-container">
      <h2>AI Writing Assistant</h2>
      <p>
        Type a short self-introduction or email, and the AI will improve it.
      </p>
      <div className="writing-io">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here..."
        />
        <div className="writing-output">
          {improvedText ? (
            <ReactMarkdown>{improvedText}</ReactMarkdown>
          ) : (
            <p style={{ color: '#888' }}>AI's improved version will appear here...</p>
          )}
        </div>
      </div>
      
      {/* --- NEW: Tone Selector and Button Group --- */}
      <div className="writing-controls">
        <label htmlFor="tone-select">Select Tone:</label>
        <select 
          id="tone-select"
          className="tone-select"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="Professional">Professional</option>
          <option value="Friendly">Friendly</option>
          <option value="Persuasive">Persuasive</option>
          <option value="Concise">Concise</option>
        </select>
        
        <div className="buttons">
          <button onClick={handleImproveText} disabled={isLoading}>
            {isLoading ? 'Improving...' : 'Improve My Writing'}
          </button>
          <button onClick={handleClearText} className="btn-clear">
            Clear
          </button>
        </div>
      </div>
      {/* ------------------------------------------- */}
    </div>
  );
}

export default Writing;