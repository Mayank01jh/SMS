import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';
import { loadSettings, saveSettings } from '../lib/storage';

export default function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-backdrop" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">Settings</h2>
          <button id="settings-close-btn" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <div className="settings-panel__body">
          {/* AI Provider */}
          <section className="settings-section">
            <h3 className="settings-section__heading">AI Provider</h3>
            <p className="settings-section__desc">
              Connect a real AI provider to generate actual study content. Without an API key, demo content is used.
            </p>
            <div className="settings-radio-group">
              {[
                { value: 'demo',   label: '🎭 Demo mode', sub: 'No API key needed — illustrative content' },
                { value: 'openai', label: '🤖 OpenAI',    sub: 'GPT-4o-mini or GPT-4o' },
                { value: 'gemini', label: '✨ Gemini',     sub: 'gemini-1.5-flash or gemini-1.5-pro' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`settings-radio ${settings.apiProvider === opt.value ? 'settings-radio--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={opt.value}
                    checked={settings.apiProvider === opt.value}
                    onChange={() => update('apiProvider', opt.value)}
                    className="settings-radio__input"
                  />
                  <span className="settings-radio__label">{opt.label}</span>
                  <span className="settings-radio__sub">{opt.sub}</span>
                </label>
              ))}
            </div>
          </section>

          {/* API Key */}
          {settings.apiProvider !== 'demo' && (
            <section className="settings-section">
              <h3 className="settings-section__heading">API Key</h3>
              <p className="settings-section__desc">
                Your key is stored only in your browser's localStorage and is never sent to our servers.
              </p>
              <div className="settings-key-row">
                <input
                  id="api-key-input"
                  className="input"
                  type={showKey ? 'text' : 'password'}
                  placeholder={settings.apiProvider === 'openai' ? 'sk-...' : 'AIza...'}
                  value={settings.apiKey}
                  onChange={(e) => update('apiKey', e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  id="toggle-key-visibility"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowKey(!showKey)}
                  type="button"
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? '🙈' : '👁'}
                </button>
              </div>
            </section>
          )}

          {/* Model selection */}
          {settings.apiProvider === 'openai' && (
            <section className="settings-section">
              <h3 className="settings-section__heading">Model</h3>
              <select
                id="openai-model-select"
                className="input"
                value={settings.openaiModel}
                onChange={(e) => update('openaiModel', e.target.value)}
              >
                <option value="gpt-4o-mini">gpt-4o-mini (fast, affordable)</option>
                <option value="gpt-4o">gpt-4o (most capable)</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (legacy)</option>
              </select>
            </section>
          )}
          {settings.apiProvider === 'gemini' && (
            <section className="settings-section">
              <h3 className="settings-section__heading">Model</h3>
              <select
                id="gemini-model-select"
                className="input"
                value={settings.geminiModel}
                onChange={(e) => update('geminiModel', e.target.value)}
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (fast)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (most capable)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              </select>
            </section>
          )}

          {/* Privacy note */}
          <div className="settings-notice">
            <span>🔒</span>
            <p>Your API key and generated documents stay in your browser. Nothing is stored on external servers in demo mode.</p>
          </div>
        </div>

        <div className="settings-panel__footer">
          <button id="settings-save-btn" className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save settings'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
