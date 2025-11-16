// src/components/Interview.jsx
import React, { useState, useEffect } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// -------- SpeechRecognition Setup --------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

const baseSystemPrompt = `You are an expert hiring manager. You will conduct a mock behavioral interview. Start with a simple greeting and the first question. After I answer, evaluate my answer briefly (1-2 sentences) and then ask the next logical follow-up question. Keep the interview going.`;

function Interview() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    { role: "system", content: baseSystemPrompt },
  ]);
  const [hasInterviewStarted, setHasInterviewStarted] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [jobRole, setJobRole] = useState("");

  // NEW: latest per-answer voice analysis
  const [lastAnalysis, setLastAnalysis] = useState(null);

  // Text-to-Speech state
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ----- Speech recognition handlers -----
  useEffect(() => {
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentTranscript(transcript);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  }, []);

  // ----- Text-to-Speech function -----
  const speakText = (text) => {
    if (!textToSpeechEnabled || !text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean up text (remove markdown formatting, extra whitespace)
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with period
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ----- Auto-speak when new interviewer message arrives -----
  useEffect(() => {
    if (!hasInterviewStarted || !textToSpeechEnabled) return;

    // Get the last message in the conversation
    const lastMessage = conversation[conversation.length - 1];
    
    // Only speak assistant (interviewer) messages
    if (lastMessage && lastMessage.role === "assistant" && lastMessage.content) {
      // Small delay to ensure message is rendered
      const timer = setTimeout(() => {
        if (!textToSpeechEnabled) return;
        
        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Clean up text (remove markdown formatting, extra whitespace)
        const cleanText = lastMessage.content
          .replace(/\*\*/g, '') // Remove bold markdown
          .replace(/\*/g, '') // Remove italic markdown
          .replace(/#{1,6}\s/g, '') // Remove headers
          .replace(/\n{2,}/g, '. ') // Replace multiple newlines with period
          .replace(/\n/g, ' ') // Replace single newlines with space
          .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      }, 500);

      return () => {
        clearTimeout(timer);
        // Cancel speech if component unmounts or conversation changes
        window.speechSynthesis.cancel();
      };
    }
  }, [conversation, hasInterviewStarted, textToSpeechEnabled]);

  // Cleanup speech on unmount or interview end
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleStartListening = () => {
    setCurrentTranscript("");
    setIsListening(true);
    recognition.start();
    console.log("Mic on");
  };

  const handleStopListening = () => {
    setIsListening(false);
    recognition.stop();
    console.log("Mic off");
  };

  // ----- Start / End Interview -----
  const handleStartInterview = async () => {
    setIsLoading(true);
    setHasInterviewStarted(true);
    setLastAnalysis(null); // reset previous analysis

    const roleSpecificSystemMessage = {
      role: "system",
      content: `You are an expert hiring manager for a **${jobRole}** position. You will conduct a mock interview. Ask me questions **relevant to this specific role**. Start with a simple greeting and the first question. After I answer, evaluate my answer briefly (1-2 sentences) and then ask the next logical follow-up question. Keep the interview going.`,
    };

    const initialConversation = [roleSpecificSystemMessage];
    setConversation(initialConversation);

    try {
      const reply = await groq.chat.completions.create({
        messages: initialConversation,
        model: "llama-3.1-8b-instant",
      });
      setConversation((prev) => [...prev, reply.choices[0].message]);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
    setIsLoading(false);
  };

  const handleEndInterview = () => {
    if (isListening) {
      handleStopListening();
    }
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
    setHasInterviewStarted(false);
    setCurrentTranscript("");
    setLastAnalysis(null);
    console.log("Interview ended by user.");

    if (conversation.length > 1) {
      const allChats = JSON.parse(localStorage.getItem("interviewChats")) || [];
      allChats.push(conversation);
      localStorage.setItem("interviewChats", JSON.stringify(allChats));
    }

    window.dispatchEvent(new CustomEvent("interviewEnded"));
  };

  const toggleTextToSpeech = () => {
    if (textToSpeechEnabled) {
      // If disabling, stop current speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setTextToSpeechEnabled(!textToSpeechEnabled);
  };

  // ----- Send Answer + Voice Analyzer -----
  const handleSendAnswer = async () => {
    if (isListening) {
      handleStopListening();
    }
    if (!currentTranscript) return;

    setIsLoading(true);

    const userMessage = { role: "user", content: currentTranscript };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);

    // Save scores for dashboard
    const saveScoreToLocalStorage = (scores) => {
      const allScores =
        JSON.parse(localStorage.getItem("interviewScores")) || [];
      allScores.push({ ...scores, date: new Date().toISOString() });
      localStorage.setItem("interviewScores", JSON.stringify(allScores));
      window.dispatchEvent(new CustomEvent("interviewEnded"));
    };

    // System prompt asking Groq to act as VOICE / DELIVERY ANALYZER
    const systemPrompt = `You are an expert speech and communication coach analyzing an interview answer.

The user's transcribed speech answer is: "${currentTranscript}"

Perform a comprehensive analysis focusing on:
1. Speech Clarity: How clear and understandable the speech is (word pronunciation, articulation, enunciation)
2. Sentence Formation: Grammar, sentence structure, completeness, and flow
3. Communication Effectiveness: How well the message is conveyed

Return ONLY a JSON object in this exact format:

{
  "clarity": [number 1-10],
  "coherence": [number 1-10],
  "confidence": [number 1-10],
  "nervousness": [number 1-10],
  "filler_word_count": [integer],
  "speaking_pace": "[\"too fast\" | \"balanced\" | \"too slow\"]",
  "tone": "[\"confident\" | \"neutral\" | \"uncertain\"]",
  "speech_clarity_score": [number 1-10],
  "sentence_formation_score": [number 1-10],
  "grammar_score": [number 1-10],
  "speech_clarity_feedback": "[Detailed feedback on pronunciation, articulation, and clarity - 2-3 sentences]",
  "sentence_formation_feedback": "[Detailed feedback on sentence structure, grammar, and completeness - 2-3 sentences]",
  "communication_tips": ["tip 1", "tip 2", "tip 3"],
  "grammar_issues": ["specific grammar issue 1", "specific grammar issue 2"],
  "strengths": ["strength 1", "strength 2"],
  "feedback": "[Overall constructive feedback - 2-3 sentences]",
  "next_question": "[next logical follow-up interview question]"
}`;

    try {
      const reply = await groq.chat.completions.create({
        messages: [...newConversation, { role: "system", content: systemPrompt }],
        model: "llama-3.1-8b-instant",
      });

      const responseText = reply.choices[0].message.content;

      try {
        // Some safety: pull the first JSON-looking block
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON object found in response.");

        const responseJson = JSON.parse(jsonMatch[0]);

        // Build nice assistant message: feedback + next question
        const aiMessage = {
          role: "assistant",
          content: `${responseJson.feedback}\n\n${responseJson.next_question}`,
        };
        setConversation((prev) => [...prev, aiMessage]);

        // Update local latest analysis panel with enhanced feedback
        const analysis = {
          clarity: responseJson.clarity,
          coherence: responseJson.coherence,
          confidence: responseJson.confidence,
          nervousness: responseJson.nervousness,
          fillerWords: responseJson.filler_word_count,
          speakingPace: responseJson.speaking_pace,
          tone: responseJson.tone,
          // Enhanced speech analysis
          speechClarityScore: responseJson.speech_clarity_score || responseJson.clarity,
          sentenceFormationScore: responseJson.sentence_formation_score || responseJson.coherence,
          grammarScore: responseJson.grammar_score || 7,
          speechClarityFeedback: responseJson.speech_clarity_feedback || responseJson.feedback,
          sentenceFormationFeedback: responseJson.sentence_formation_feedback || responseJson.feedback,
          communicationTips: responseJson.communication_tips || [],
          grammarIssues: responseJson.grammar_issues || [],
          strengths: responseJson.strengths || [],
        };
        setLastAnalysis(analysis);

        // Save key metrics to history (dashboard)
        saveScoreToLocalStorage({
          clarity: analysis.clarity,
          coherence: analysis.coherence,
          fillerWords: analysis.fillerWords,
          confidence: analysis.confidence,
          nervousness: analysis.nervousness,
        });
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError, responseText);
        const aiMessage = { role: "assistant", content: responseText };
        setConversation((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending answer:", error);
    }

    setCurrentTranscript("");
    setIsLoading(false);
  };

  // Utility for bar widths
  const toPercent = (score) =>
    typeof score === "number" ? `${(score / 10) * 100}%` : "0%";

  return (
    <div className="interview-container">
      <h2>Mock Interview Simulator</h2>

      {hasInterviewStarted && (
        <div className="conversation-history">
          {conversation.map((message, index) =>
            message.role !== "system" ? (
              <div key={index} className={`message ${message.role}`}>
                <strong>
                  {message.role === "assistant" ? "Interviewer" : "You"}:
                </strong>
                <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
              </div>
            ) : null
          )}
          {isLoading && (
            <p className="message assistant">Analyzing your answer…</p>
          )}
        </div>
      )}

      {!hasInterviewStarted ? (
        <div className="start-interview-block">
          <label htmlFor="jobRole" style={{ width: "100%" }}>
            Enter Your Target Job Role:
          </label>
          <input
            type="text"
            id="jobRole"
            className="text-input"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g., Software Engineer, Data Scientist..."
          />
          <button onClick={handleStartInterview} disabled={isLoading || !jobRole}>
            Start Interview
          </button>
        </div>
      ) : (
        <>
          <div className="interview-controls-top">
            <button
              onClick={toggleTextToSpeech}
              className={`btn-tts ${textToSpeechEnabled ? 'active' : ''}`}
              title={textToSpeechEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            >
              {isSpeaking ? '🔊 Speaking...' : textToSpeechEnabled ? '🔊 TTS On' : '🔇 TTS Off'}
            </button>
          </div>
          <div className="answer-area">
            <textarea
              value={currentTranscript}
              onChange={(e) => setCurrentTranscript(e.target.value)}
              placeholder="Speak or type your answer here..."
            />
            <div className="buttons">
              <button
                onClick={
                  isListening ? handleStopListening : handleStartListening
                }
              >
                {isListening ? "Stop Recording" : "Record Answer"}
              </button>
              <button
                onClick={handleSendAnswer}
                disabled={isLoading || !currentTranscript}
              >
                Send Answer
              </button>
              <button
                onClick={handleEndInterview}
                className="btn-end"
                disabled={isLoading}
              >
                End Interview
              </button>
            </div>
          </div>

          {/* --- Voice & Delivery Analyzer Panel --- */}
          {lastAnalysis && (
            <div className="voice-analyzer-panel">
              <h3>Voice & Delivery Analysis (last answer)</h3>

              <div className="metrics-row">
                <div className="metric">
                  <span>Clarity</span>
                  <div className="bar">
                    <div
                      className="bar-fill clarity"
                      style={{ width: toPercent(lastAnalysis.clarity) }}
                    />
                  </div>
                  <span className="score">{lastAnalysis.clarity} / 10</span>
                </div>

                <div className="metric">
                  <span>Coherence</span>
                  <div className="bar">
                    <div
                      className="bar-fill coherence"
                      style={{ width: toPercent(lastAnalysis.coherence) }}
                    />
                  </div>
                  <span className="score">{lastAnalysis.coherence} / 10</span>
                </div>

                <div className="metric">
                  <span>Confidence</span>
                  <div className="bar">
                    <div
                      className="bar-fill confidence"
                      style={{ width: toPercent(lastAnalysis.confidence) }}
                    />
                  </div>
                  <span className="score">{lastAnalysis.confidence} / 10</span>
                </div>

                <div className="metric">
                  <span>Nervousness</span>
                  <div className="bar">
                    <div
                      className="bar-fill nervousness"
                      style={{ width: toPercent(lastAnalysis.nervousness) }}
                    />
                  </div>
                  <span className="score">{lastAnalysis.nervousness} / 10</span>
                </div>
              </div>

              <div className="metrics-row secondary">
                <div className="chip">
                  Filler words: <strong>{lastAnalysis.fillerWords}</strong>
                </div>
                <div className="chip">
                  Pace: <strong>{lastAnalysis.speakingPace}</strong>
                </div>
                <div className="chip">
                  Tone: <strong>{lastAnalysis.tone}</strong>
                </div>
              </div>

              {/* Enhanced Speech Analysis Section */}
              <div className="enhanced-analysis-section">
                <h4>📊 Detailed Speech Analysis</h4>
                
                <div className="analysis-scores-grid">
                  <div className="analysis-score-card">
                    <div className="score-header">
                      <span>🎯 Speech Clarity</span>
                      <span className="score-badge">{lastAnalysis.speechClarityScore}/10</span>
                    </div>
                    <div className="bar">
                      <div
                        className="bar-fill clarity"
                        style={{ width: toPercent(lastAnalysis.speechClarityScore) }}
                      />
                    </div>
                    <p className="feedback-text">{lastAnalysis.speechClarityFeedback}</p>
                  </div>

                  <div className="analysis-score-card">
                    <div className="score-header">
                      <span>📝 Sentence Formation</span>
                      <span className="score-badge">{lastAnalysis.sentenceFormationScore}/10</span>
                    </div>
                    <div className="bar">
                      <div
                        className="bar-fill coherence"
                        style={{ width: toPercent(lastAnalysis.sentenceFormationScore) }}
                      />
                    </div>
                    <p className="feedback-text">{lastAnalysis.sentenceFormationFeedback}</p>
                  </div>

                  <div className="analysis-score-card">
                    <div className="score-header">
                      <span>✍️ Grammar</span>
                      <span className="score-badge">{lastAnalysis.grammarScore}/10</span>
                    </div>
                    <div className="bar">
                      <div
                        className="bar-fill confidence"
                        style={{ width: toPercent(lastAnalysis.grammarScore) }}
                      />
                    </div>
                  </div>
                </div>

                {/* Strengths Section */}
                {lastAnalysis.strengths && lastAnalysis.strengths.length > 0 && (
                  <div className="feedback-section positive">
                    <h5>✅ Strengths</h5>
                    <ul>
                      {lastAnalysis.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Grammar Issues Section */}
                {lastAnalysis.grammarIssues && lastAnalysis.grammarIssues.length > 0 && (
                  <div className="feedback-section improvement">
                    <h5>⚠️ Grammar & Language Issues</h5>
                    <ul>
                      {lastAnalysis.grammarIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Communication Tips Section */}
                {lastAnalysis.communicationTips && lastAnalysis.communicationTips.length > 0 && (
                  <div className="feedback-section tips">
                    <h5>💡 Communication Tips</h5>
                    <ul>
                      {lastAnalysis.communicationTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Interview;
