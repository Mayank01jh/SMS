import React, { useState, useRef, useCallback } from 'react';
import './WorkspaceInput.css';
import { generateContent } from '../lib/generateContent';

const PROMPTS = {
  'concept-guide':       'e.g. "Photosynthesis", "Keynesian economics", "Gradient descent"',
  'practice-breakdown':  'e.g. "Integration by parts", "Supply and demand equilibrium", "Recursive algorithms"',
  'topic-brief':         'e.g. "The French Revolution", "DNA replication", "Object-oriented programming"',
};

const TEMPLATES = [
  { id: 'biology', label: '🧬 Biology', value: 'Cell respiration and ATP synthesis' },
  { id: 'econ',    label: '📈 Economics', value: 'Supply and demand equilibrium' },
  { id: 'cs',      label: '💻 Computer Science', value: 'Binary search trees' },
  { id: 'history', label: '📜 History', value: 'The causes of World War I' },
  { id: 'physics', label: '⚛️ Physics', value: "Newton's laws of motion" },
  { id: 'maths',   label: '📐 Mathematics', value: 'Integration by parts' },
];

export default function WorkspaceInput({ type, onGenerated, onBack }) {
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const topicRef = useRef(null);

  const handleGenerate = useCallback(async () => {
    const t = topic.trim();
    if (!t) {
      topicRef.current?.focus();
      return;
    }
    setError(null);
    setGenerating(true);
    setProgress({ label: 'Starting…', pct: 5 });
    try {
      const doc = await generateContent(
        { type: type.id, topic: t, sourceMaterial: source },
        (p) => setProgress(p),
      );
      onGenerated(doc);
    } catch (e) {
      setError('Generation failed. Please try again.');
      setGenerating(false);
      setProgress(null);
    }
  }, [topic, source, type, onGenerated]);

  const handleTemplate = (val) => {
    setTopic(val);
    topicRef.current?.focus();
  };

  return (
    <div className="workspace-input">
      <div className="container workspace-input__inner">

        {/* Header */}
        <div className="workspace-input__header">
          <span className="workspace-input__type-badge">
            {type.emoji} {type.label}
          </span>
          <h2 className="workspace-input__heading">What topic do you want to explore?</h2>
          <p className="workspace-input__sub">
            Add optional source material (lecture notes, textbook passages) to ground the guide in your course content.
          </p>
        </div>

        {/* Full-width prompt band (PRD §9) */}
        <div className="workspace-input__band card">

          {/* Topic */}
          <div className="workspace-input__field-group">
            <label htmlFor="topic-input" className="workspace-input__label">
              Topic or question <span className="workspace-input__required" aria-hidden="true">*</span>
            </label>
            <input
              id="topic-input"
              ref={topicRef}
              className="input workspace-input__topic-input"
              type="text"
              placeholder={PROMPTS[type.id] || 'Enter a topic…'}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !generating) handleGenerate(); }}
              disabled={generating}
              aria-required="true"
              aria-describedby="topic-hint"
              maxLength={300}
            />
            <div id="topic-hint" className="workspace-input__hint">
              <span>Press Enter or click Generate</span>
              <span>{topic.length}/300</span>
            </div>
          </div>

          {/* Quick templates */}
          <div className="workspace-input__templates">
            <span className="workspace-input__templates-label">Try a template:</span>
            <div className="workspace-input__templates-row">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  id={`template-${t.id}`}
                  className="btn btn-ghost btn-sm workspace-input__template-btn"
                  onClick={() => handleTemplate(t.value)}
                  disabled={generating}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Source material */}
          <div className="workspace-input__field-group">
            <label htmlFor="source-input" className="workspace-input__label">
              Source material <span className="workspace-input__optional">(optional)</span>
            </label>
            <textarea
              id="source-input"
              className="textarea"
              placeholder="Paste lecture notes, textbook passages, or any course material here. The guide will prioritise your content and clearly distinguish generated explanations from cited text."
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={generating}
              aria-describedby="source-hint"
              maxLength={8000}
            />
            <div id="source-hint" className="workspace-input__hint">
              <span>Your material stays private and is not stored beyond this session.</span>
              <span>{source.length}/8000</span>
            </div>
          </div>

          {/* Actions */}
          <div className="workspace-input__actions">
            <button
              id="generate-btn"
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              aria-busy={generating}
            >
              {generating ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Generating…
                </>
              ) : (
                'Generate'
              )}
            </button>
            <p className="workspace-input__note">
              This tool helps you learn and understand material. Do not submit generated content as your own independent work.
            </p>
          </div>

          {/* Progress */}
          {generating && progress && (
            <div className="workspace-input__progress" role="status" aria-live="polite">
              <div className="workspace-input__progress-bar">
                <div
                  className="workspace-input__progress-fill"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
              <span className="workspace-input__progress-label">{progress.label}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="workspace-input__error" role="alert">
              ⚠ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
