import { useState } from "react";
import DropZone from "./DropZone";
import WordCount from "./WordCount";
import { uploadResume, submitMatch, getMatchResult } from "../lib/api";

export default function LandingAnalysisWidget({ onGuestResult }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [inputMode, setInputMode] = useState("text"); // 'text' or 'url'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // 'uploading', 'analyzing', etc.
  const [error, setError] = useState("");

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  async function pollForResult(taskId) {
    for (let i = 0; i < 60; i++) {
      const r = await getMatchResult(taskId);
      if (r.status === "completed") return r;
      if (r.status === "failed") throw new Error(r.error || "Analysis failed.");
      await wait(2000);
    }
    throw new Error("Analysis timed out. Please try again.");
  }

  const handleAnalyse = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError("Please upload your resume first.");
      return;
    }
    if (inputMode === "text" && !jdText.trim()) {
      setError("Please paste a job description.");
      return;
    }
    if (inputMode === "url" && !jdUrl.trim()) {
      setError("Please paste a job URL.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Uploading resume...");

    try {
      // 1. Upload Resume
      const up = await uploadResume(resumeFile);
      
      setStatus("Analyzing match...");
      // 2. Submit Match
      const submitted = await submitMatch({
        resume_text: up.extracted_text || "",
        jd_text: inputMode === "text" ? jdText.trim() : null,
        jd_url: inputMode === "url" ? jdUrl.trim() : null,
      });

      // 3. Poll for result
      const res = await pollForResult(submitted.task_id);

      // 4. Send result back to parent
      if (onGuestResult) {
        onGuestResult(res.result, { up, file: resumeFile, jdText, jdUrl: inputMode === "url" ? jdUrl : null });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="landing-widget loading-state">
        <div className="spinner">✦</div>
        <h3>{status}</h3>
        <p>Our semantic AI is processing your request. This usually takes 15-30 seconds.</p>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill animated" />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-widget">
      <div className="widget-header">
        <h3>Start Your Free Analysis</h3>
        <p>Upload your resume and paste a JD to see your hiring probability.</p>
      </div>

      <form onSubmit={handleAnalyse} className="stack">
        <div className="field-group">
          <label className="field-label">1. Your Resume (PDF)</label>
          <DropZone file={resumeFile} onChange={setResumeFile} />
        </div>

        <div className="field-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="field-label">2. Job Description</label>
            <div className="tab-toggle">
              <button 
                type="button" 
                className={inputMode === 'text' ? 'active' : ''} 
                onClick={() => setInputMode('text')}
              >Text</button>
              <button 
                type="button" 
                className={inputMode === 'url' ? 'active' : ''} 
                onClick={() => setInputMode('url')}
              >URL</button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <>
              <textarea 
                placeholder="Paste the job description here..." 
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                style={{ minHeight: '120px' }}
              />
              <WordCount text={jdText} />
            </>
          ) : (
            <input 
              type="url" 
              placeholder="https://www.linkedin.com/jobs/view/..." 
              value={jdUrl}
              onChange={e => setJdUrl(e.target.value)}
            />
          )}
        </div>

        {error && <p className="status-note error">{error}</p>}

        <button 
          className="btn-primary btn-lg" 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          Analyse My Resume →
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
          🔒 Privacy First: Your data is processed in-session and not stored.
        </p>
      </form>
    </div>
  );
}
