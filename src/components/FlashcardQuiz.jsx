import React, { useState, useEffect, useCallback } from 'react';
import './FlashcardQuiz.css';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildCards(doc) {
  const cards = [];
  // From revision card sections
  for (const s of doc.revisionCard.sections) {
    if (s.content.trim()) {
      cards.push({ question: s.label, answer: s.content });
    }
  }
  // From self-check sections in study guide
  for (const s of doc.studyGuide.sections) {
    if (s.heading.toLowerCase().includes('self-check') || s.heading.toLowerCase().includes('question')) {
      const lines = s.body.split('\n').filter((l) => /^\d+\./.test(l.trim()));
      for (const q of lines) {
        cards.push({ question: q.replace(/^\d+\.\s*/, ''), answer: '(Write your answer — then reveal)' });
      }
    }
  }
  return shuffle(cards);
}

export default function FlashcardQuiz({ doc, onClose }) {
  const [cards] = useState(() => buildCards(doc));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]); // 'know' | 'review'
  const [done, setDone] = useState(false);

  const card = cards[idx];
  const total = cards.length;
  const progress = Math.round(((idx) / total) * 100);

  const next = useCallback((result) => {
    setResults((r) => [...r, result]);
    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  }, [idx, total]);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === ' ' || e.key === 'Enter') { setFlipped(f => !f); }
      if (e.key === 'ArrowRight' && flipped) next('know');
      if (e.key === 'ArrowLeft'  && flipped) next('review');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, next, onClose]);

  const knowCount = results.filter((r) => r === 'know').length;
  const reviewCount = results.filter((r) => r === 'review').length;

  return (
    <div className="flashcard-overlay" role="dialog" aria-modal="true" aria-label="Flashcard quiz">
      <div className="flashcard-backdrop" onClick={onClose} />
      <div className="flashcard-modal">
        {/* Header */}
        <div className="flashcard-header">
          <div className="flashcard-header__left">
            <span className="flashcard-header__label">🃏 Flashcard Quiz</span>
            {!done && (
              <span className="flashcard-header__count">
                {idx + 1} / {total}
              </span>
            )}
          </div>
          <button id="flashcard-close-btn" className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        {/* Progress */}
        {!done && (
          <div className="flashcard-progress">
            <div className="flashcard-progress__bar">
              <div className="flashcard-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flashcard-progress__stats">
              {knowCount > 0 && <span className="flashcard-know">✓ {knowCount} know</span>}
              {reviewCount > 0 && <span className="flashcard-review">↺ {reviewCount} review</span>}
            </div>
          </div>
        )}

        {done ? (
          /* Results screen */
          <div className="flashcard-results fade-in">
            <span className="flashcard-results__emoji">
              {knowCount >= Math.ceil(total * 0.8) ? '🎉' : knowCount >= Math.ceil(total * 0.5) ? '👍' : '📚'}
            </span>
            <h3 className="flashcard-results__heading">Quiz complete!</h3>
            <p className="flashcard-results__sub">
              You knew <strong>{knowCount}</strong> of <strong>{total}</strong> cards.
            </p>
            <div className="flashcard-results__bar">
              <div className="flashcard-results__know" style={{ width: `${Math.round((knowCount / total) * 100)}%` }} />
            </div>
            <div className="flashcard-results__actions">
              <button id="quiz-restart-btn" className="btn btn-primary" onClick={() => { setIdx(0); setFlipped(false); setResults([]); setDone(false); }}>
                Retry all
              </button>
              <button className="btn btn-secondary" onClick={onClose}>Back to document</button>
            </div>
          </div>
        ) : (
          /* Card */
          <div className="flashcard-scene">
            <button
              id={`flashcard-${idx}`}
              className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`}
              onClick={() => setFlipped(!flipped)}
              aria-label={flipped ? 'Click to see question' : 'Click to reveal answer'}
            >
              <div className="flashcard__face flashcard__face--front">
                <span className="flashcard__face-label">QUESTION</span>
                <p className="flashcard__text">{card.question}</p>
                <span className="flashcard__hint">Click or press Space to reveal</span>
              </div>
              <div className="flashcard__face flashcard__face--back">
                <span className="flashcard__face-label">ANSWER</span>
                <p className="flashcard__text">{card.answer}</p>
              </div>
            </button>

            {/* Answer actions */}
            <div className={`flashcard-actions ${flipped ? 'flashcard-actions--visible' : ''}`}>
              <button
                id="flashcard-review-btn"
                className="btn flashcard-actions__btn flashcard-actions__btn--review"
                onClick={() => next('review')}
                disabled={!flipped}
                aria-label="Still learning (←)"
              >
                ↺ Still learning
              </button>
              <button
                id="flashcard-know-btn"
                className="btn flashcard-actions__btn flashcard-actions__btn--know"
                onClick={() => next('know')}
                disabled={!flipped}
                aria-label="Got it (→)"
              >
                Got it ✓
              </button>
            </div>

            <p className="flashcard-keyboard-hint">
              <kbd>Space</kbd> flip · <kbd>→</kbd> got it · <kbd>←</kbd> review
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
