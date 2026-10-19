import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SearchBar.css';

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="search-highlight">{p}</mark>
      : p
  );
}

export default function SearchBar({ doc, visible, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(''); }
  }, [visible]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const hits = [];
    for (const s of doc.studyGuide.sections) {
      if (s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)) {
        hits.push({ id: s.id, heading: s.heading, body: s.body, location: 'Study Guide' });
      }
    }
    for (const s of doc.revisionCard.sections) {
      if (s.label.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)) {
        hits.push({ id: s.label, heading: s.label, body: s.content, location: 'Revision Card' });
      }
    }
    return hits;
  }, [query, doc]);

  if (!visible) return null;

  return (
    <div className="search-bar-overlay" role="search">
      <div className="search-bar-backdrop" onClick={onClose} />
      <div className="search-bar-modal">
        <div className="search-bar__input-row">
          <span className="search-bar__icon" aria-hidden="true">🔍</span>
          <input
            id="doc-search-input"
            ref={inputRef}
            className="search-bar__input"
            type="search"
            placeholder="Search study guide and revision card…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search document"
          />
          {query && (
            <span className="search-bar__count">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          )}
          <button id="search-close-btn" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close search">✕</button>
        </div>

        {query && (
          <div className="search-bar__results">
            {results.length === 0 ? (
              <div className="search-bar__empty">No results for "{query}"</div>
            ) : (
              results.map((r, i) => (
                <div key={i} className="search-result">
                  <div className="search-result__meta">
                    <span className="search-result__location">{r.location}</span>
                    <span className="search-result__heading">{highlight(r.heading, query)}</span>
                  </div>
                  <p className="search-result__preview">
                    {highlight(r.body.slice(0, 180), query)}
                    {r.body.length > 180 && '…'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
