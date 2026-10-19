import React from 'react';
import './EntryCards.css';

// PRD §9: Three equal tiles across the top
const TYPES = [
  {
    id: 'concept-guide',
    emoji: '📚',
    label: 'Concept Guide',
    desc: 'Definitions, explanations, worked examples and a concise revision card.',
    tags: ['Definitions', 'Examples', 'Revision Card'],
  },
  {
    id: 'practice-breakdown',
    emoji: '🧩',
    label: 'Practice Breakdown',
    desc: 'Step-by-step problem decomposition, worked solutions and self-check questions.',
    tags: ['Step-by-step', 'Self-check Qs', 'Summary'],
  },
  {
    id: 'topic-brief',
    emoji: '📋',
    label: 'Topic Brief',
    desc: 'A concise overview of the key points, ordered for revision and retention.',
    tags: ['Key points', 'Concise', 'Revision-ready'],
  },
];

export default function EntryCards({ onSelect }) {
  return (
    <section className="entry-section" aria-label="Choose a document type">
      <div className="container">
        <h2 className="entry-section__heading">What would you like to create?</h2>
        <div className="entry-cards" role="list">
          {TYPES.map((t, i) => (
            <button
              key={t.id}
              id={`entry-card-${t.id}`}
              className="entry-card"
              role="listitem"
              onClick={() => onSelect(t)}
              aria-label={`Create a ${t.label}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="entry-card__emoji" aria-hidden="true">{t.emoji}</span>
              <span className="entry-card__title">{t.label}</span>
              <p className="entry-card__desc">{t.desc}</p>
              <div className="entry-card__tags">
                {t.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <span className="entry-card__cta">Get started →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
