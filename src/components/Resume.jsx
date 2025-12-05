// src/components/Resume.jsx
import React, { useState } from 'react';
import Groq from 'groq-sdk';
import pdfToText from 'react-pdftotext';
import ReactMarkdown from 'react-markdown';

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
    console.warn('VITE_GROQ_API_KEY is not set. Some features may not work.');
  }
} catch (error) {
  console.error('Error initializing Groq client:', error);
}

function Resume() {
  const [jobTitle, setJobTitle] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [atsScore, setAtsScore] = useState(null); // NEW: ATS Score state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  
  // --- NEW: State for the Job Description ---
  const [jobDescription, setJobDescription] = useState('');
  // ------------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setError('');
    pdfToText(file)
      .then((text) => setResumeText(text))
      .catch((pdfError) => {
        console.error('Error parsing PDF:', pdfError);
        setError('Error reading PDF file. Please try another file.');
      });
  };

  // --- UPDATED: handleAnalyzeResume with ATS Score ---
  const handleAnalyzeResume = async () => {
    if (!resumeText || !jobTitle) {
      setError('Please upload a resume and enter a job title.');
      return;
    }
    setIsLoading(true);
    setAnalysis('');
    setAtsScore(null); // Reset ATS score
    setError('');

    let prompt = '';

    // Check if the user provided a job description
    if (jobDescription.trim() !== '') {
      // --- Use the new, more powerful prompt with ATS scoring ---
      prompt = `You are an expert AI Talent Recruiter and ATS (Applicant Tracking System) specialist.
        A candidate is applying for the role of "${jobTitle}".
        
        Analyze the resume for ATS compatibility and compare it against the provided job description.
        
        IMPORTANT: You must provide your response starting with this EXACT format:
        
        **ATS Score: [number from 0-100]**
        
        Then provide a concise, actionable analysis in these sections:
        1.  **ATS Compatibility:** A brief assessment of how well the resume will pass through ATS systems (formatting, keywords, structure).
        2.  **Missing Key Requirements:** A bulleted list of the most important skills or experiences from the job description that are *missing* from the resume.
        3.  **Resume Strengths:** A bulleted list of the strongest matches between the resume and the job description.
        
        Keep the entire analysis concise.
        
        ---
        JOB DESCRIPTION:
        "${jobDescription}"
        ---
        RESUME TEXT:
        "${resumeText}"`;
    } else {
      // --- Fall back to the original prompt with ATS scoring ---
      prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist for tech companies.
        Analyze the following resume text based on the target job role of "${jobTitle}".
        (Since no job description was provided, you will analyze based on the job title alone).
        
        IMPORTANT: You must provide your response starting with this EXACT format:
        
        **ATS Score: [number from 0-100]**
        
        Then provide a concise, actionable analysis in these sections:
        1.  **ATS Compatibility:** A brief assessment of how well the resume will pass through ATS systems (formatting, keywords, structure).
        2.  **Skill Gaps:** A bulleted list of key skills for a "${jobTitle}" that are missing from the resume.
        3.  **Vague Statements:** A bulleted list of phrases that are too vague.
        4.  **Formatting Issues:** A bulleted list of any quick formatting suggestions for better ATS compatibility.
        
        ---
        Resume Text:
        "${resumeText}"`;
    }

    try {
      if (!groq) {
        throw new Error('API key not configured. Please set VITE_GROQ_API_KEY environment variable.');
      }
      const reply = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
      });
      
      const responseText = reply.choices[0].message.content;
      
      // Extract ATS score from response
      const atsScoreMatch = responseText.match(/\*\*ATS Score:\s*(\d+)\*\*/i) || 
                           responseText.match(/ATS Score:\s*(\d+)/i) ||
                           responseText.match(/ATS.*?Score.*?(\d+)/i);
      
      if (atsScoreMatch) {
        const score = parseInt(atsScoreMatch[1], 10);
        if (score >= 0 && score <= 100) {
          setAtsScore(score);
        }
      }
      
      setAnalysis(responseText);
    } catch (apiError) {
      console.error('Error with Groq API:', apiError);
      setError('Sorry, an error occurred during analysis.');
    }
    setIsLoading(false);
  };
  // -----------------------------------------

  // --- UPDATED: handleClearResume ---
  const handleClearResume = () => {
    setJobTitle('');
    setResumeText('');
    setAnalysis('');
    setAtsScore(null); // Clear ATS score
    setError('');
    setJobDescription('');
    setFileInputKey(Date.now());
  };
  // -----------------------------------

  // Helper function to get ATS score color
  const getAtsScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow/Orange
    return '#ef4444'; // Red
  };

  // Helper function to get ATS score label
  const getAtsScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="resume-container">
      <h2>AI Resume Analyzer</h2>
      <div className="resume-inputs">
        <label>
          1. Upload Your Resume (PDF)
          <input 
            key={fileInputKey} 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
          />
        </label>
        <label>
          2. Enter Your Target Job Role
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer, Product Manager..."
          />
        </label>
        
        {/* --- NEW: Job Description Textarea --- */}
        <label>
          3. Paste Job Description (Optional, but recommended)
          <textarea
            className="jd-textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here for a more accurate analysis..."
          />
        </label>
        {/* ------------------------------------- */}
      </div>
      
      <div className="buttons">
        <button onClick={handleAnalyzeResume} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze My Resume'}
        </button>
        <button onClick={handleClearResume} className="btn-clear">
          Clear
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- NEW: ATS Score Display --- */}
      {atsScore !== null && (
        <div className="ats-score-container">
          <div className="ats-score-header">
            <h3>ATS Compatibility Score</h3>
            <span className="ats-score-label" style={{ color: getAtsScoreColor(atsScore) }}>
              {getAtsScoreLabel(atsScore)}
            </span>
          </div>
          <div className="ats-score-circle" style={{ 
            background: `conic-gradient(${getAtsScoreColor(atsScore)} ${atsScore * 3.6}deg, var(--bg-tertiary) ${atsScore * 3.6}deg)`
          }}>
            <div className="ats-score-inner">
              <span className="ats-score-number">{atsScore}</span>
              <span className="ats-score-out-of">/ 100</span>
            </div>
          </div>
          <p className="ats-score-description">
            This score indicates how well your resume will pass through Applicant Tracking Systems (ATS).
            {atsScore >= 80 && ' Great job! Your resume is well-optimized for ATS.'}
            {atsScore >= 60 && atsScore < 80 && ' Your resume is decent, but there\'s room for improvement.'}
            {atsScore < 60 && ' Your resume needs significant improvements to pass ATS screening.'}
          </p>
        </div>
      )}
      {/* ----------------------------- */}

      {analysis && (
        <div className="resume-analysis">
          <h3>Detailed Analysis:</h3>
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default Resume;