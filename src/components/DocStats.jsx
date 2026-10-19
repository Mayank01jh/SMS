import React, { useMemo } from 'react';
import './DocStats.css';

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(words) {
  const mins = Math.ceil(words / 200); // avg reading speed
  return mins;
}

export default function DocStats({ doc }) {
  const stats = useMemo(() => {
    const guideText = doc.studyGuide.sections.map((s) => `${s.heading} ${s.body}`).join(' ');
    const cardText = doc.revisionCard.sections.map((s) => `${s.label} ${s.content}`).join(' ');
    const totalText = guideText + ' ' + cardText;
    const words = countWords(totalText);
    const chars = totalText.replace(/\s/g, '').length;
    const sections = doc.studyGuide.sections.length;
    const cardSections = doc.revisionCard.sections.length;
    const mins = readingTime(words);
    const generatedAt = doc.generatedAt ? new Date(doc.generatedAt) : null;

    return { words, chars, sections, cardSections, mins, generatedAt };
  }, [doc]);

  return (
    <div className="doc-stats">
      <div className="doc-stats__grid">
        <div className="doc-stat">
          <span className="doc-stat__value">{stats.words.toLocaleString()}</span>
          <span className="doc-stat__label">words</span>
        </div>
        <div className="doc-stat">
          <span className="doc-stat__value">{stats.mins}</span>
          <span className="doc-stat__label">min read</span>
        </div>
        <div className="doc-stat">
          <span className="doc-stat__value">{stats.sections}</span>
          <span className="doc-stat__label">sections</span>
        </div>
        <div className="doc-stat">
          <span className="doc-stat__value">{stats.cardSections}</span>
          <span className="doc-stat__label">card fields</span>
        </div>
      </div>
      {stats.generatedAt && (
        <div className="doc-stats__timestamp">
          Generated {stats.generatedAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      )}
    </div>
  );
}
