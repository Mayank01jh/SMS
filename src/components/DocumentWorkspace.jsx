import React, { useState, useCallback, useRef, useEffect } from 'react';
import './DocumentWorkspace.css';
import StudyGuideEditor from './StudyGuideEditor';
import RevisionCard from './RevisionCard';
import ExportBar from './ExportBar';
import DocStats from './DocStats';
import FlashcardQuiz from './FlashcardQuiz';
import SearchBar from './SearchBar';
import { saveSession } from '../lib/storage';

export default function DocumentWorkspace({ doc, type, onNew }) {
  const [currentDoc, setCurrentDoc] = useState(doc);
  const [savedAt, setSavedAt] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [focusMode, setFocusMode] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const saveTimer = useRef(null);

  // Auto-save to localStorage
  const triggerSave = useCallback((nextDoc) => {
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveSession(nextDoc, type);
      setSaveState('saved');
      setSavedAt(new Date());
      setTimeout(() => setSaveState('idle'), 2500);
    }, 600);
  }, [type]);

  // Save on first load too
  useEffect(() => {
    saveSession(doc, type);
  }, [doc, type]);

  const handleGuideChange = useCallback((updatedGuide) => {
    const next = { ...currentDoc, studyGuide: updatedGuide };
    setCurrentDoc(next);
    triggerSave(next);
  }, [currentDoc, triggerSave]);

  const handleCardChange = useCallback((updatedCard) => {
    const next = { ...currentDoc, revisionCard: updatedCard };
    setCurrentDoc(next);
    triggerSave(next);
  }, [currentDoc, triggerSave]);

  // Keyboard shortcut: Ctrl+K for search, Ctrl+J for focus, Escape for focus exit
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setFocusMode((f) => !f);
      }
      if (e.key === 'Escape' && focusMode && !showSearch && !showFlashcards) {
        setFocusMode(false);
      }
    };
    const searchListener = () => setShowSearch(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('sms:open-search', searchListener);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('sms:open-search', searchListener);
    };
  }, [focusMode, showSearch, showFlashcards]);

  return (
    <div className={`doc-workspace ${focusMode ? 'doc-workspace--focus' : ''}`}>
      {/* Focus mode overlay bar */}
      {focusMode && (
        <div className="focus-bar">
          <span className="focus-bar__label">Focus mode</span>
          <button id="exit-focus-btn" className="btn btn-ghost btn-sm" onClick={() => setFocusMode(false)}>
            ✕ Exit focus
          </button>
        </div>
      )}

      <div className="container doc-workspace__inner">

        {/* Workspace header */}
        <div className="doc-workspace__header">
          <div className="doc-workspace__header-left">
            <span className="badge">{type.emoji} {type.label}</span>
            <h1 className="doc-workspace__title">{currentDoc.studyGuide.title}</h1>
          </div>
          <div className="doc-workspace__header-right">
            <SaveIndicator state={saveState} savedAt={savedAt} />

            <button
              id="focus-mode-btn"
              className={`btn btn-ghost btn-sm ${focusMode ? 'btn-ghost--active' : ''}`}
              onClick={() => setFocusMode((f) => !f)}
              title="Focus / distraction-free mode (Ctrl+J)"
              aria-label="Toggle focus mode"
            >
              {focusMode ? '🔵 Focused' : '🎯 Focus'}
            </button>

            <button
              id="flashcard-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowFlashcards(true)}
              aria-label="Start flashcard quiz"
            >
              🃏 Quiz me
            </button>

            <button
              id="search-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowSearch(true)}
              title="Search document (Ctrl+K)"
              aria-label="Search document"
            >
              🔍
            </button>

            <button
              id="new-doc-btn"
              className="btn btn-ghost btn-sm"
              onClick={onNew}
            >
              + New
            </button>
          </div>
        </div>

        {/* Document stats */}
        <DocStats doc={currentDoc} />

        {/* Two-column layout */}
        <div className="doc-workspace__columns">
          <section
            className="doc-workspace__col doc-workspace__col--guide"
            aria-label="Study Guide"
          >
            <div className="doc-workspace__col-header">
              <span className="doc-workspace__col-label">📖 Study Guide</span>
              <span className="tag">Editable · click ○ to mark reviewed</span>
            </div>
            <StudyGuideEditor
              guide={currentDoc.studyGuide}
              onChange={handleGuideChange}
            />
          </section>

          <section
            className="doc-workspace__col doc-workspace__col--card"
            aria-label="Revision Card"
          >
            <div className="doc-workspace__col-header">
              <span className="doc-workspace__col-label">🗂 Revision Card</span>
              <span className="tag">Click to edit</span>
            </div>
            <RevisionCard
              card={currentDoc.revisionCard}
              onChange={handleCardChange}
            />
          </section>
        </div>

        {/* Export actions bar */}
        <ExportBar doc={currentDoc} type={type} />

      </div>

      {/* Overlays */}
      {showFlashcards && (
        <FlashcardQuiz
          doc={currentDoc}
          onClose={() => setShowFlashcards(false)}
        />
      )}

      <SearchBar
        doc={currentDoc}
        visible={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </div>
  );
}

function SaveIndicator({ state, savedAt }) {
  if (state === 'idle' && !savedAt) return null;
  return (
    <div className="save-indicator" aria-live="polite">
      {state === 'saving' && (
        <span className="save-indicator__text save-indicator__text--saving">
          <span className="spinner save-indicator__spinner" aria-hidden="true" />
          Saving…
        </span>
      )}
      {state === 'saved' && (
        <span className="save-indicator__text save-indicator__text--saved">
          ✓ Saved {savedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      {state === 'idle' && savedAt && (
        <span className="save-indicator__text save-indicator__text--idle">
          Saved {savedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
