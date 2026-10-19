import React from 'react';
import './SessionHistory.css';
import { loadSessions, deleteSession } from '../lib/storage';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function SessionHistory({ onLoad, onClose }) {
  const [sessions, setSessions] = React.useState(loadSessions);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(loadSessions());
  };

  const handleLoad = (session) => {
    onLoad(session.doc, { id: session.type, label: session.typeLabel, emoji: session.typeEmoji });
    onClose();
  };

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="history-overlay" role="dialog" aria-modal="true" aria-label="Session history">
      <div className="history-backdrop" onClick={onClose} />
      <div className="history-panel">
        <div className="history-panel__header">
          <div>
            <h2 className="history-panel__title">Document History</h2>
            <p className="history-panel__sub">{sessions.length} saved session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          <button id="history-close-btn" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close history">✕</button>
        </div>

        <div className="history-panel__body">
          {sessions.length === 0 ? (
            <div className="history-empty">
              <span className="history-empty__icon">🗃</span>
              <p>No saved sessions yet.</p>
              <p className="history-empty__sub">Documents are saved automatically when you generate them.</p>
            </div>
          ) : (
            <div className="history-list">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="history-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleLoad(s)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLoad(s); }}
                  aria-label={`Load ${s.topic} (${s.typeLabel})`}
                >
                  <span className="history-item__emoji" aria-hidden="true">{s.typeEmoji}</span>
                  <div className="history-item__info">
                    <span className="history-item__topic">{s.topic}</span>
                    <span className="history-item__meta">{s.typeLabel} · {timeAgo(s.savedAt)}</span>
                  </div>
                  <button
                    id={`delete-session-${s.id}`}
                    className="btn btn-ghost btn-sm history-item__delete"
                    onClick={(e) => handleDelete(s.id, e)}
                    aria-label={`Delete ${s.topic}`}
                    title="Delete"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
