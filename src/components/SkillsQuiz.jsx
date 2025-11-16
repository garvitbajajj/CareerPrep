// src/components/SkillsQuiz.jsx
import React, { useState } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SKILL_CATEGORIES = [
  'JavaScript',
  'Python',
  'React',
  'Data Structures & Algorithms',
  'System Design',
  'SQL',
  'General Programming',
];

function SkillsQuiz() {
  const [category, setCategory] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [explanations, setExplanations] = useState({});

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setExplanations({});

    const systemPrompt = `You are an expert technical interviewer. Generate 5 ${difficulty.toLowerCase()} difficulty ${category} interview questions.

      Return ONLY a JSON array in this exact format:
      [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0,
          "explanation": "Brief explanation of why this answer is correct"
        },
        ...
      ]

      Make sure:
      - Questions are appropriate for ${difficulty.toLowerCase()} difficulty
      - Focus on ${category} concepts
      - Each question has exactly 4 options
      - The "correct" field is the index (0-3) of the correct option
      - Explanations are clear and educational`;

    try {
      const reply = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 5 ${difficulty} ${category} questions.` },
        ],
        model: 'llama-3.1-8b-instant',
      });

      const responseText = reply.choices[0].message.content;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(parsedQuestions);
      } else {
        alert('Error parsing questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const newExplanations = {};

    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correctCount++;
      }
      newExplanations[index] = q.explanation;
    });

    setScore(correctCount);
    setExplanations(newExplanations);
    setShowResults(true);
  };

  const handleResetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setExplanations({});
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <div className="skills-quiz-container">
      <h2>Technical Skills Assessment</h2>
      <p>Test your technical knowledge with AI-generated quizzes tailored to your skill level.</p>

      {questions.length === 0 ? (
        <div className="quiz-setup">
          <div className="input-row">
            <label>
              Skill Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="tone-select"
              >
                {SKILL_CATEGORIES.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Difficulty Level
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="tone-select"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
          </div>
          <button onClick={handleGenerateQuiz} disabled={isLoading}>
            {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
          </button>
        </div>
      ) : !showResults ? (
        <div className="quiz-content">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <p>
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="question-card">
            <h3>{currentQuestion.question}</h3>
            <div className="options-list">
              {currentQuestion.options.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className={`option-label ${
                    selectedAnswers[currentQuestionIndex] === optIndex ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={optIndex}
                    checked={selectedAnswers[currentQuestionIndex] === optIndex}
                    onChange={() => handleAnswerSelect(currentQuestionIndex, optIndex)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="quiz-navigation">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </button>
              {isLastQuestion ? (
                <button onClick={handleSubmitQuiz} disabled={!allAnswered} className="btn-submit">
                  Submit Quiz ✓
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
                  }
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-results">
          <div className="results-header">
            <h3>Quiz Results</h3>
            <div className="score-display">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {questions.length}</span>
            </div>
            <p className="score-percentage">
              {Math.round((score / questions.length) * 100)}% Correct
            </p>
          </div>

          <div className="results-questions">
            {questions.map((q, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === q.correct;
              return (
                <div
                  key={index}
                  className={`result-question ${isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="result-header">
                    <span className="result-icon">{isCorrect ? '✓' : '✗'}</span>
                    <h4>Question {index + 1}</h4>
                  </div>
                  <p className="result-question-text">{q.question}</p>
                  <div className="result-answers">
                    <div className="result-answer">
                      <strong>Your Answer:</strong>{' '}
                      <span className={isCorrect ? 'correct-text' : 'incorrect-text'}>
                        {q.options[userAnswer]}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="result-answer">
                        <strong>Correct Answer:</strong>{' '}
                        <span className="correct-text">{q.options[q.correct]}</span>
                      </div>
                    )}
                  </div>
                  <div className="result-explanation">
                    <strong>Explanation:</strong> {explanations[index]}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleResetQuiz} className="btn-reset">
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default SkillsQuiz;

