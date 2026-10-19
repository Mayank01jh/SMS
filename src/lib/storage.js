/**
 * localStorage persistence layer for SMS app.
 * Handles session history and settings.
 */

const SESSION_KEY = 'sms_sessions';
const SETTINGS_KEY = 'sms_settings';
const MAX_SESSIONS = 20;

// ── Sessions ──────────────────────────────────────────────

export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(doc, type) {
  try {
    const sessions = loadSessions();
    const entry = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      topic: doc.topic,
      type: type.id,
      typeLabel: type.label,
      typeEmoji: type.emoji,
      doc,
    };
    // Replace existing session with same topic+type if present, otherwise prepend
    const existing = sessions.findIndex(
      (s) => s.topic === doc.topic && s.type === type.id
    );
    if (existing !== -1) {
      sessions[existing] = entry;
    } else {
      sessions.unshift(entry);
      if (sessions.length > MAX_SESSIONS) sessions.length = MAX_SESSIONS;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
    return entry.id;
  } catch {
    return null;
  }
}

export function deleteSession(id) {
  try {
    const sessions = loadSessions().filter((s) => s.id !== id);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  } catch {}
}

// ── Settings ──────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  apiProvider: 'demo', // 'openai' | 'gemini' | 'demo'
  apiKey: '',
  geminiModel: 'gemini-1.5-flash',
  openaiModel: 'gpt-4o-mini',
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
