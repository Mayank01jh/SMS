import React from 'react';
import './LandingHero.css';

export default function LandingHero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container hero__inner">
        <div className="hero__label badge">Study support · Not submission ghostwriting</div>
        <h1 id="hero-heading" className="hero__heading">
          Understand any topic.<br />
          <span className="hero__heading-dim">Deeply.</span>
        </h1>
        <p className="hero__body">
          Enter a topic or paste your source material. Study Material Studio
          generates structured guides, revision cards and practice breakdowns
          that help you learn — not copy.
        </p>
        <div className="hero__pills">
          <span className="tag">📚 Concept Guides</span>
          <span className="tag">🗂 Revision Cards</span>
          <span className="tag">🧩 Practice Breakdowns</span>
          <span className="tag">✏️ Voice &amp; Clarity Edits</span>
          <span className="tag">📄 DOCX &amp; PDF Export</span>
        </div>
      </div>
    </section>
  );
}
