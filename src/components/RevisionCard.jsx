import React, { useState } from 'react';
import './RevisionCard.css';

export default function RevisionCard({ card, onChange }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditVal(card.sections[idx].content);
  };

  const saveEdit = (idx) => {
    const sections = card.sections.map((s, i) =>
      i === idx ? { ...s, content: editVal } : s
    );
    onChange({ ...card, sections });
    setEditingIdx(null);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
  };

  return (
    <div className="revision-card card">
      <div className="revision-card__title">{card.title}</div>
      <div className="revision-card__sections">
        {card.sections.map((s, idx) => (
          <div key={idx} className={`revision-card__section ${editingIdx === idx ? 'revision-card__section--editing' : ''}`}>
            <div className="revision-card__section-label">{s.label}</div>
            {editingIdx === idx ? (
              <>
                <textarea
                  className="textarea revision-card__edit"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  aria-label={`Edit ${s.label}`}
                  rows={4}
                  autoFocus
                />
                <div className="revision-card__edit-actions">
                  <button
                    id={`rc-save-${idx}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => saveEdit(idx)}
                  >Save</button>
                  <button
                    id={`rc-cancel-${idx}`}
                    className="btn btn-ghost btn-sm"
                    onClick={cancelEdit}
                  >Cancel</button>
                </div>
              </>
            ) : (
              <div
                className="revision-card__section-content"
                onClick={() => startEdit(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startEdit(idx); }}
                aria-label={`Edit ${s.label}`}
                title="Click to edit"
              >
                {s.content.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < s.content.split('\n').length - 1 ? <br/> : null}</span>
                ))}
                <span className="revision-card__edit-hint" aria-hidden="true">✎</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="revision-card__footer">
        <span className="revision-card__footer-note">Click any field to edit</span>
      </div>
    </div>
  );
}
