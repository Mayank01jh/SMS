import React, { useState, useCallback } from 'react';
import './App.css';
import TopNav from './components/TopNav';
import LandingHero from './components/LandingHero';
import EntryCards from './components/EntryCards';
import WorkspaceInput from './components/WorkspaceInput';
import DocumentWorkspace from './components/DocumentWorkspace';
import SettingsPanel from './components/SettingsPanel';
import SessionHistory from './components/SessionHistory';

// App states
const VIEWS = {
  HOME: 'home',
  WORKSPACE: 'workspace',
  EDITOR: 'editor',
};

export default function App() {
  const [view, setView] = useState(VIEWS.HOME);
  const [selectedType, setSelectedType] = useState(null);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSelectType = useCallback((type) => {
    setSelectedType(type);
    setView(VIEWS.WORKSPACE);
  }, []);

  const handleGenerated = useCallback((doc) => {
    setGeneratedDoc(doc);
    setView(VIEWS.EDITOR);
  }, []);

  const handleBack = useCallback(() => {
    if (view === VIEWS.EDITOR) {
      setView(VIEWS.WORKSPACE);
    } else {
      setView(VIEWS.HOME);
      setSelectedType(null);
      setGeneratedDoc(null);
    }
  }, [view]);

  const handleNewSession = useCallback(() => {
    setView(VIEWS.HOME);
    setSelectedType(null);
    setGeneratedDoc(null);
  }, []);

  const handleLoadSession = useCallback((doc, type) => {
    setGeneratedDoc(doc);
    setSelectedType(type);
    setView(VIEWS.EDITOR);
  }, []);

  const handleOpenSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent('sms:open-search'));
  }, []);

  return (
    <div className="app">
      <TopNav
        view={view}
        onBack={handleBack}
        onNew={handleNewSession}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSearch={handleOpenSearch}
      />
      <main className="app__main">
        {view === VIEWS.HOME && (
          <div className="fade-in">
            <LandingHero />
            <EntryCards onSelect={handleSelectType} />
          </div>
        )}
        {view === VIEWS.WORKSPACE && (
          <div className="fade-in">
            <WorkspaceInput
              type={selectedType}
              onGenerated={handleGenerated}
              onBack={handleBack}
            />
          </div>
        )}
        {view === VIEWS.EDITOR && generatedDoc && (
          <div className="fade-in">
            <DocumentWorkspace
              doc={generatedDoc}
              type={selectedType}
              onNew={handleNewSession}
            />
          </div>
        )}
      </main>

      {/* Overlays */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      {showHistory && (
        <SessionHistory
          onLoad={handleLoadSession}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
