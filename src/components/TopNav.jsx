import React from 'react';
import './TopNav.css';
import { loadSettings } from '../lib/storage';

export default function TopNav({ view, onBack, onNew, onOpenSettings, onOpenHistory, onOpenSearch }) {
  const settings = loadSettings();
  const hasApiKey = settings.apiKey && settings.apiKey.trim().length > 10 && settings.apiProvider !== 'demo';

  return (
    <header className="topnav" role="banner">
      <div className="container topnav__inner">
        {/* Logo */}
        <a href="#" className="topnav__logo" onClick={(e) => { e.preventDefault(); onNew(); }}>
          <span className="topnav__logo-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect width="20" height="20" rx="5" fill="#111"/>
              <rect x="4" y="5" width="5" height="10" rx="1.5" fill="white"/>
              <rect x="11" y="5" width="5" height="6" rx="1.5" fill="white"/>
              <rect x="11" y="13" width="5" height="2" rx="1" fill="white" opacity=".5"/>
            </svg>
          </span>
          <span className="topnav__logo-text">Study Material Studio</span>
        </a>

        {/* Center */}
        <nav className="topnav__nav" aria-label="Main navigation">
          {view === 'home' && (
            <span className="topnav__tagline">AI-powered study materials, built for understanding.</span>
          )}
          {view === 'workspace' && (
            <span className="topnav__crumb">New document</span>
          )}
          {view === 'editor' && (
            <span className="topnav__crumb">Document editor</span>
          )}
        </nav>

        {/* Actions */}
        <div className="topnav__actions">
          {/* Search — only in editor */}
          {view === 'editor' && onOpenSearch && (
            <button
              id="nav-search-btn"
              className="btn btn-ghost btn-sm"
              onClick={onOpenSearch}
              aria-label="Search document (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              🔍
            </button>
          )}

          {/* History */}
          {onOpenHistory && (
            <button
              id="nav-history-btn"
              className="btn btn-ghost btn-sm"
              onClick={onOpenHistory}
              aria-label="Open document history"
              title="History"
            >
              🗃
            </button>
          )}

          {/* Settings */}
          {onOpenSettings && (
            <button
              id="nav-settings-btn"
              className={`btn btn-ghost btn-sm ${!hasApiKey ? 'topnav__settings-alert' : ''}`}
              onClick={onOpenSettings}
              aria-label="Open settings"
              title={hasApiKey ? 'Settings' : 'Settings — connect an AI provider for real content'}
            >
              ⚙{!hasApiKey && <span className="topnav__settings-dot" aria-hidden="true" />}
            </button>
          )}

          {view !== 'home' && (
            <button
              id="nav-back-btn"
              className="btn btn-ghost btn-sm"
              onClick={onBack}
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          <button
            id="nav-new-btn"
            className="btn btn-secondary btn-sm"
            onClick={onNew}
            aria-label="Start a new document"
          >
            + New
          </button>
        </div>
      </div>
    </header>
  );
}
