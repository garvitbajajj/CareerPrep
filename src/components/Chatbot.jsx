// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';

// Safely initialize Groq client
let groq;
try {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey) {
    groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  } else {
    console.warn('VITE_GROQ_API_KEY is not set. Chatbot may not work.');
  }
} catch (error) {
  console.error('Error initializing Groq client:', error);
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your CareerPrep AI assistant. I can help you navigate and use CareerPrep's features:\n\n• **Resume Analyzer** - Get ATS scores and resume feedback\n• **Mock Interview Simulator** - Practice with voice recognition and real-time feedback\n• **Writing Assistant** - Improve your job application text\n• **Question Bank** - Generate and practice interview questions\n• **Skills Quiz** - Test your technical knowledge\n• **Dashboard** - Track your progress and get personalized suggestions\n\nWhat would you like to know about CareerPrep?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!groq) {
        throw new Error('API key not configured. Please set VITE_GROQ_API_KEY environment variable.');
      }

      // Build conversation history
      const conversationHistory = [
        {
          role: 'system',
          content: `You are the AI assistant for CareerPrep (🚀 CareerPrep - Your AI-Powered Career Preparation Platform). You are knowledgeable about ALL the features and components available on the CareerPrep website.

IMPORTANT: When users ask about the website, its features, or how to use it, you MUST reference the actual components and features by their exact names as they appear on CareerPrep.

CAREERPREP FEATURES AND COMPONENTS:

1. **Resume Analyzer** (Resume component):
   - Upload PDF resumes and get AI-powered analysis
   - ATS (Applicant Tracking System) scoring
   - Job description matching
   - Detailed feedback on resume content, keywords, and optimization
   - Suggestions for improvement based on job title and description

2. **Mock Interview Simulator** (Interview component):
   - Practice behavioral interviews with AI-powered interviewer
   - Voice recognition for speech-to-text answers
   - Real-time voice analysis including:
     * Clarity score (1-10)
     * Coherence score (1-10)
     * Confidence level (1-10)
     * Nervousness level (1-10)
     * Filler word count
     * Speaking pace analysis
     * Grammar and sentence formation feedback
   - Text-to-speech for interviewer questions
   - Job role-specific interview questions
   - Per-answer detailed feedback with communication tips

3. **Writing Assistant** (Writing component):
   - Improve text for job applications
   - Tone selection (Professional, Friendly, Formal, etc.)
   - AI-powered rewriting with key improvements highlighted
   - Optimized for cover letters, emails, and application text

4. **Question Bank** (QuestionBank component):
   - Generate interview questions by category:
     * Behavioral
     * Technical
     * Leadership
     * Problem-Solving
     * Culture Fit
     * Salary & Negotiation
   - Job role-specific question generation
   - Answer evaluation with feedback
   - Tips for answering each question

5. **Skills Quiz** (SkillsQuiz component):
   - Technical skills assessment
   - Categories: JavaScript, Python, React, Data Structures & Algorithms, System Design, SQL, General Programming
   - Difficulty levels: Easy, Medium, Hard
   - Multiple choice questions with explanations
   - Score tracking and performance review

6. **Dashboard** (Dashboard component):
   - Progress tracking over time with charts
   - Average scores for clarity, coherence, confidence, nervousness, filler words
   - Adaptive learning suggestions based on performance
   - Trend analysis (improving/declining)
   - Personalized recommendations with priority levels (high/medium/low)
   - Performance insights and actionable tips

7. **Interview History** (History component):
   - View all past interview sessions
   - Review previous conversations and scores
   - Track improvement over time

8. **Data Management** (DataManagementPage):
   - Export interview data and scores
   - Import/backup functionality
   - Clear all data option

WHEN ANSWERING QUESTIONS:
- Always reference the exact component names (e.g., "Mock Interview Simulator", "Resume Analyzer", "Question Bank")
- Guide users to specific features when relevant
- Explain how features work and what they can expect
- Be specific about what each component does and its capabilities
- When users ask "what can this website do?" or "what features are available?", list all the components above
- Use the actual terminology from the website

Be concise, practical, and encouraging. Use bullet points when appropriate. Keep responses under 300 words unless the user asks for detailed information. Always be specific about CareerPrep's actual features.`,
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const reply = await groq.chat.completions.create({
        messages: conversationHistory,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantMessage = reply.choices[0].message.content;
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "👋 Hello! I'm your CareerPrep AI assistant. I can help you navigate and use CareerPrep's features:\n\n• **Resume Analyzer** - Get ATS scores and resume feedback\n• **Mock Interview Simulator** - Practice with voice recognition and real-time feedback\n• **Writing Assistant** - Improve your job application text\n• **Question Bank** - Generate and practice interview questions\n• **Skills Quiz** - Test your technical knowledge\n• **Dashboard** - Track your progress and get personalized suggestions\n\nWhat would you like to know about CareerPrep?",
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
        title="Open AI Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <span className="chatbot-icon">🤖</span>
              <div>
                <h3>CareerPrep AI Assistant</h3>
                <p className="chatbot-subtitle">Ask me anything about your career!</p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                onClick={handleClearChat}
                className="chatbot-clear-btn"
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-close-btn"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  {message.role === 'assistant' && (
                    <span className="message-avatar">🤖</span>
                  )}
                  <div className="message-text">
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  {message.role === 'user' && (
                    <span className="message-avatar">👤</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant-message">
                <div className="message-content">
                  <span className="message-avatar">🤖</span>
                  <div className="message-text">
                    <span className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;

