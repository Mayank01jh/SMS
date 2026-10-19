import React, { useState } from 'react';
import './ExportBar.css';

// PRD §9: Six compact export/refinement actions
const ACTIONS = [
  { id: 'export-docx',    icon: '📄', label: 'Export DOCX',   desc: 'Download as Word file' },
  { id: 'export-pdf',     icon: '📑', label: 'Export PDF',    desc: 'Download as PDF' },
  { id: 'preview',        icon: '👁',  label: 'Preview',       desc: 'See page layout' },
  { id: 'clarity',        icon: '✏️',  label: 'Voice & Clarity', desc: 'Improve tone & flow' },
  { id: 'simplify',       icon: '🔤', label: 'Simplify',       desc: 'Easier vocabulary' },
  { id: 'regenerate',     icon: '🔄', label: 'Regenerate',    desc: 'Re-generate section' },
];

function formatDoc(doc) {
  let text = `${doc.studyGuide.title}\n${'='.repeat(doc.studyGuide.title.length)}\n\n`;
  for (const s of doc.studyGuide.sections) {
    text += `${s.heading}\n${'-'.repeat(s.heading.length)}\n${s.body}\n\n`;
  }
  text += `\n${doc.revisionCard.title}\n${'='.repeat(doc.revisionCard.title.length)}\n\n`;
  for (const s of doc.revisionCard.sections) {
    text += `${s.label}\n${s.content}\n\n`;
  }
  return text;
}

export default function ExportBar({ doc, type }) {
  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  };

  const handleAction = async (actionId) => {
    setLoadingId(actionId);

    if (actionId === 'export-docx') {
      await new Promise(r => setTimeout(r, 800));
      // Simulate DOCX download as plain text blob
      const text = formatDoc(doc);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.topic || 'study-guide'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('DOCX downloaded (plain text for demo — connect a real DOCX library for production)');
    } else if (actionId === 'export-pdf') {
      await new Promise(r => setTimeout(r, 800));
      window.print();
      showToast('Print dialog opened — save as PDF');
    } else if (actionId === 'preview') {
      setPreviewOpen(true);
    } else if (actionId === 'clarity') {
      await new Promise(r => setTimeout(r, 600));
      showToast('Voice & Clarity: Suggestions ready — connect your AI provider to apply real edits (V1.5)');
    } else if (actionId === 'simplify') {
      await new Promise(r => setTimeout(r, 600));
      showToast('Simplify: Vocabulary reduction suggestions ready — connect AI provider for V1.5');
    } else if (actionId === 'regenerate') {
      await new Promise(r => setTimeout(r, 600));
      showToast('Select a section in the editor and use the Edit control to regenerate it.');
    }

    setLoadingId(null);
  };

  return (
    <>
      <div className="export-bar" role="group" aria-label="Export and refinement actions">
        <div className="export-bar__label">Actions</div>
        {/* PRD §9: Six equal tiles */}
        <div className="export-bar__tiles">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              id={action.id}
              className="export-tile"
              onClick={() => handleAction(action.id)}
              disabled={loadingId !== null}
              aria-label={action.label}
              title={action.desc}
            >
              <span className="export-tile__icon" aria-hidden="true">
                {loadingId === action.id ? <span className="spinner" /> : action.icon}
              </span>
              <span className="export-tile__label">{action.label}</span>
              <span className="export-tile__desc">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.kind}`} role="status" aria-live="polite">
          {toast.kind === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      {/* Print preview */}
      {previewOpen && (
        <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Document preview">
          <div className="preview-modal__backdrop" onClick={() => setPreviewOpen(false)} />
          <div className="preview-modal__sheet">
            <div className="preview-modal__toolbar">
              <span className="preview-modal__title">Page preview</span>
              <div className="preview-modal__toolbar-actions">
                <button className="btn btn-primary btn-sm" onClick={() => { setPreviewOpen(false); handleAction('export-pdf'); }}>
                  Export PDF
                </button>
                <button id="close-preview-btn" className="btn btn-ghost btn-sm" onClick={() => setPreviewOpen(false)}>✕ Close</button>
              </div>
            </div>
            <div className="preview-modal__page">
              <h1 className="preview-modal__doc-title">{doc.studyGuide.title}</h1>
              {doc.studyGuide.sections.map((s) => (
                <div key={s.id} className="preview-modal__section">
                  <h2 className="preview-modal__section-heading">{s.heading}</h2>
                  <div className="preview-modal__section-body">
                    {s.body.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="preview-modal__card">
                <h2 className="preview-modal__section-heading">{doc.revisionCard.title}</h2>
                {doc.revisionCard.sections.map((s, i) => (
                  <div key={i} className="preview-modal__card-row">
                    <strong>{s.label}</strong>
                    <p style={{ whiteSpace: 'pre-line' }}>{s.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
