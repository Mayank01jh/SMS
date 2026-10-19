import React, { useState, useCallback, useRef } from 'react';
import './StudyGuideEditor.css';

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^•\s+(.+)$/gm, '<li>$1</li>')
    .replace(/<li>.*?<\/li>/gs, (m) => `<ul>${m}</ul>`)
    .replace(/^>\s+⚠️(.+)$/gm, '<div class="callout-warn">⚠️$1</div>')
    .replace(/\n/g, '<br/>');
}

// Copy-to-clipboard helper
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function SectionEditor({ section, onChange, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, reviewed, onToggleReviewed }) {
  const [editing, setEditing] = useState(false);
  const [headingVal, setHeadingVal] = useState(section.heading);
  const [bodyVal, setBodyVal] = useState(section.body);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const handleEdit = () => {
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSave = () => {
    onChange({ ...section, heading: headingVal, body: bodyVal });
    setEditing(false);
  };

  const handleCancel = () => {
    setHeadingVal(section.heading);
    setBodyVal(section.body);
    setEditing(false);
  };

  const handleCopy = async () => {
    const text = `${section.heading}\n\n${section.body}`;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className={`section-editor ${editing ? 'section-editor--editing' : ''} ${reviewed ? 'section-editor--reviewed' : ''}`}>
      {/* Review checkbox */}
      <label className="section-editor__review-check" title={reviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}>
        <input
          type="checkbox"
          checked={reviewed}
          onChange={onToggleReviewed}
          className="section-editor__review-input"
          aria-label={reviewed ? 'Mark section as not reviewed' : 'Mark section as reviewed'}
        />
        <span className={`section-editor__review-indicator ${reviewed ? 'section-editor__review-indicator--done' : ''}`} aria-hidden="true">
          {reviewed ? '✓' : '○'}
        </span>
      </label>

      {/* Section heading */}
      {editing ? (
        <input
          className="input section-editor__heading-input"
          value={headingVal}
          onChange={(e) => setHeadingVal(e.target.value)}
          aria-label="Section heading"
        />
      ) : (
        <h3 className={`section-editor__heading ${reviewed ? 'section-editor__heading--reviewed' : ''}`}>
          {section.heading}
        </h3>
      )}

      {/* Section body */}
      {editing ? (
        <textarea
          ref={textareaRef}
          className="textarea section-editor__body-input"
          value={bodyVal}
          onChange={(e) => setBodyVal(e.target.value)}
          aria-label="Section body"
          rows={8}
        />
      ) : (
        <div
          className="section-editor__body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }}
        />
      )}

      {/* Controls */}
      <div className="section-editor__controls">
        {editing ? (
          <>
            <button id={`save-section-${section.id}`} className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            <button id={`cancel-section-${section.id}`} className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button id={`edit-section-${section.id}`} className="btn btn-ghost btn-sm" onClick={handleEdit} title="Edit section">✎ Edit</button>
            <button
              id={`copy-section-${section.id}`}
              className="btn btn-ghost btn-sm"
              onClick={handleCopy}
              title="Copy section text"
              aria-label="Copy section to clipboard"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button
              id={`move-up-${section.id}`}
              className="btn btn-ghost btn-sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Move up"
              aria-label="Move section up"
            >↑</button>
            <button
              id={`move-down-${section.id}`}
              className="btn btn-ghost btn-sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Move down"
              aria-label="Move section down"
            >↓</button>
            <button
              id={`delete-section-${section.id}`}
              className="btn btn-ghost btn-sm section-editor__delete"
              onClick={onDelete}
              title="Delete section"
              aria-label="Delete section"
            >✕</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudyGuideEditor({ guide, onChange }) {
  const [history, setHistory] = useState([guide]);
  const [histIdx, setHistIdx] = useState(0);
  const [reviewed, setReviewed] = useState({}); // sectionId -> bool

  const commit = useCallback((nextGuide) => {
    const newHistory = history.slice(0, histIdx + 1);
    newHistory.push(nextGuide);
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
    onChange(nextGuide);
  }, [history, histIdx, onChange]);

  const undo = useCallback(() => {
    if (histIdx > 0) {
      const prev = history[histIdx - 1];
      setHistIdx(histIdx - 1);
      onChange(prev);
    }
  }, [history, histIdx, onChange]);

  const handleSectionChange = (idx, updatedSection) => {
    const sections = [...guide.sections];
    sections[idx] = updatedSection;
    commit({ ...guide, sections });
  };

  const handleDelete = (idx) => {
    const sections = guide.sections.filter((_, i) => i !== idx);
    commit({ ...guide, sections });
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const sections = [...guide.sections];
    [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
    commit({ ...guide, sections });
  };

  const handleMoveDown = (idx) => {
    if (idx === guide.sections.length - 1) return;
    const sections = [...guide.sections];
    [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
    commit({ ...guide, sections });
  };

  const addSection = () => {
    const newSection = {
      id: `s${Date.now()}`,
      heading: 'New Section',
      body: 'Start writing here…',
    };
    commit({ ...guide, sections: [...guide.sections, newSection] });
  };

  const toggleReviewed = (sectionId) => {
    setReviewed((r) => ({ ...r, [sectionId]: !r[sectionId] }));
  };

  const reviewedCount = guide.sections.filter((s) => reviewed[s.id]).length;
  const totalCount = guide.sections.length;
  const progressPct = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

  return (
    <div className="study-guide-editor">
      {/* Toolbar */}
      <div className="study-guide-editor__toolbar">
        <div className="study-guide-editor__toolbar-left">
          <button
            id="undo-btn"
            className="btn btn-ghost btn-sm"
            onClick={undo}
            disabled={histIdx === 0}
            aria-label="Undo last change"
          >
            ↩ Undo
          </button>
          <span className="study-guide-editor__section-count">
            {guide.sections.length} section{guide.sections.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Progress tracker */}
        <div className="study-guide-editor__progress" title={`${reviewedCount} of ${totalCount} sections reviewed`}>
          <div className="study-guide-editor__progress-bar">
            <div
              className="study-guide-editor__progress-fill"
              style={{ width: `${progressPct}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="study-guide-editor__progress-label">
            {reviewedCount}/{totalCount} reviewed
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="study-guide-editor__sections">
        {guide.sections.map((section, idx) => (
          <SectionEditor
            key={section.id}
            section={section}
            onChange={(updated) => handleSectionChange(idx, updated)}
            onDelete={() => handleDelete(idx)}
            onMoveUp={() => handleMoveUp(idx)}
            onMoveDown={() => handleMoveDown(idx)}
            canMoveUp={idx > 0}
            canMoveDown={idx < guide.sections.length - 1}
            reviewed={!!reviewed[section.id]}
            onToggleReviewed={() => toggleReviewed(section.id)}
          />
        ))}
      </div>

      {/* Add section */}
      <button id="add-section-btn" className="btn btn-ghost study-guide-editor__add" onClick={addSection}>
        + Add section
      </button>
    </div>
  );
}
