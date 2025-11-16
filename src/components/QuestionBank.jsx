// src/components/QuestionBank.jsx
import React, { useState } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const QUESTION_CATEGORIES = [
  'Behavioral',
  'Technical',
  'Leadership',
  'Problem-Solving',
  'Culture Fit',
  'Salary & Negotiation',
];

function QuestionBank() {
  const [category, setCategory] = useState('Behavioral');
  const [jobRole, setJobRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setQuestions([]);
    setSelectedAnswer({});
    setFeedback({});

    const systemPrompt = `You are an expert interview coach. Generate 5 ${category.toLowerCase()} interview questions for the role of "${jobRole || 'a general position'}".

      Return ONLY a JSON array in this exact format:
      [
        {
          "question": "Question text here",
          "tips": "Brief tip on how to answer this question"
        },
        ...
      ]

      Make the questions relevant to ${category.toLowerCase()} interviews and appropriate for ${jobRole || 'the position'}.`;

    try {
      const reply = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 5 ${category} interview questions.` },
        ],
        model: 'llama-3.1-8b-instant',
      });

      const responseText = reply.choices[0].message.content;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(parsedQuestions);
      } else {
        // Fallback: parse questions manually
        const lines = responseText.split('\n').filter(line => line.trim());
        const parsed = lines
          .filter(line => line.match(/^\d+\.|^[-*]/))
          .slice(0, 5)
          .map((line, idx) => ({
            question: line.replace(/^\d+\.|^[-*]\s*/, '').trim(),
            tips: 'Think about your relevant experience and use the STAR method (Situation, Task, Action, Result).',
          }));
        setQuestions(parsed);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Error generating questions. Please try again.');
    }
    setIsLoading(false);
  };

  const handleGetFeedback = async (questionIndex) => {
    const answer = selectedAnswer[questionIndex];
    if (!answer || answer.trim().length < 10) {
      alert('Please provide a more detailed answer (at least 10 characters).');
      return;
    }

    setIsLoading(true);
    const question = questions[questionIndex];

    const systemPrompt = `You are an expert interview coach. Evaluate this interview answer.

      Question: "${question.question}"
      Answer: "${answer}"

      Provide constructive feedback in JSON format:
      {
        "strengths": ["strength 1", "strength 2"],
        "improvements": ["improvement 1", "improvement 2"],
        "score": [number 1-10],
        "overall_feedback": "2-3 sentence overall feedback"
      }`;

    try {
      const reply = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Evaluate this answer.' },
        ],
        model: 'llama-3.1-8b-instant',
      });

      const responseText = reply.choices[0].message.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedFeedback = JSON.parse(jsonMatch[0]);
        setFeedback({ ...feedback, [questionIndex]: parsedFeedback });
      } else {
        setFeedback({
          ...feedback,
          [questionIndex]: {
            strengths: ['Your answer shows thoughtfulness.'],
            improvements: ['Try to be more specific with examples.'],
            score: 7,
            overall_feedback: responseText.substring(0, 200),
          },
        });
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      alert('Error getting feedback. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="question-bank-container">
      <h2>Interview Question Bank</h2>
      <p>Practice common interview questions by category and get AI feedback on your answers.</p>

      <div className="question-bank-controls">
        <div className="input-row">
          <label>
            Job Role (Optional)
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Engineer"
            />
          </label>
          <label>
            Question Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="tone-select"
            >
              {QUESTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={handleGenerateQuestions} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="questions-list">
          <h3>{category} Interview Questions</h3>
          {questions.map((q, index) => (
            <div key={index} className="question-card">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <h4>{q.question}</h4>
              </div>
              <p className="question-tip">💡 Tip: {q.tips}</p>

              <div className="answer-section">
                <label>
                  Your Answer:
                  <textarea
                    value={selectedAnswer[index] || ''}
                    onChange={(e) =>
                      setSelectedAnswer({ ...selectedAnswer, [index]: e.target.value })
                    }
                    placeholder="Type your answer here..."
                    rows={4}
                  />
                </label>
                <button
                  onClick={() => handleGetFeedback(index)}
                  disabled={isLoading || !selectedAnswer[index]}
                  className="btn-feedback"
                >
                  Get AI Feedback
                </button>
              </div>

              {feedback[index] && (
                <div className="feedback-card">
                  <div className="feedback-score">
                    Score: <strong>{feedback[index].score}/10</strong>
                  </div>
                  <div className="feedback-content">
                    <div className="feedback-section">
                      <strong>✅ Strengths:</strong>
                      <ul>
                        {feedback[index].strengths?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="feedback-section">
                      <strong>💡 Areas for Improvement:</strong>
                      <ul>
                        {feedback[index].improvements?.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="overall-feedback">
                      <strong>Overall:</strong> {feedback[index].overall_feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionBank;

