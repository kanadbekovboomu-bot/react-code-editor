import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { EditorPanes } from './components/EditorPanes';
import { PreviewFrame } from './components/PreviewFrame';
import { ConsoleOutput } from './components/ConsoleOutput';
import { SaveSnippetModal } from './components/SaveSnippetModal';
import { SavedSnippetsModal } from './components/SavedSnippetsModal';
import { AuthModal } from './components/AuthModal';

import { TEMPLATE_PRESETS } from './data/templatePresets';
import { 
  buildSandboxDocument, 
  exportSnippetAsHtml, 
  exportSnippetAsJson, 
  validateSnippetJson 
} from './utils/bundler';
import { parseConsoleMessage } from './utils/consoleParser';
import { StorageAdapter } from './services/storageAdapter';
import { 
  subscribeToAuth, 
  signInWithEmail, 
  signUpWithEmail, 
  signInAnonymousUser, 
  signOutUser, 
  isFirebaseConfigured 
} from './services/firebase';

export default function App() {
  const initialPreset = TEMPLATE_PRESETS[0];

  // Editor code states
  const [html, setHtml] = useState(initialPreset.html);
  const [css, setCss] = useState(initialPreset.css);
  const [js, setJs] = useState(initialPreset.js);
  const [currentTitle, setCurrentTitle] = useState(initialPreset.name);
  const [activeTemplate, setActiveTemplate] = useState(initialPreset.id);

  // Layout & UI states
  const [layoutMode, setLayoutMode] = useState('split'); // 'split' | 'tabs'
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'css' | 'js'
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  // Bundling & Preview states
  const [srcDoc, setSrcDoc] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const debounceTimerRef = useRef(null);

  // Virtual Console logs
  const [logs, setLogs] = useState([]);

  // Modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User & Storage state
  const [user, setUser] = useState(null);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [isCloudSynced, setIsCloudSynced] = useState(isFirebaseConfigured());

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compile sandbox document immediately
  const compileNow = useCallback((h = html, c = css, j = js) => {
    setIsCompiling(true);
    try {
      const doc = buildSandboxDocument(h, c, j);
      setSrcDoc(doc);
    } catch (err) {
      console.error('Compilation failed:', err);
    } finally {
      setIsCompiling(false);
    }
  }, [html, css, js]);

  // Debounced compilation when code changes
  useEffect(() => {
    setIsCompiling(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      compileNow(html, css, js);
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [html, css, js, compileNow]);

  // Initial compilation on mount
  useEffect(() => {
    compileNow(initialPreset.html, initialPreset.css, initialPreset.js);
  }, []);

  // Listen for virtual console messages from iframe
  useEffect(() => {
    const handleWindowMessage = (event) => {
      // Safe message parsing
      const parsedLog = parseConsoleMessage(event.data);
      if (parsedLog) {
        setLogs(prev => [parsedLog, ...prev.slice(0, 199)]);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  // Subscribe to Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setIsCloudSynced(isFirebaseConfigured());
      // Refresh user's snippets
      const uid = currentUser?.uid || 'guest';
      StorageAdapter.getUserSnippets(uid).then(setSavedSnippets);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load template preset
  const handleSelectTemplate = (templateId) => {
    const preset = TEMPLATE_PRESETS.find(p => p.id === templateId);
    if (preset) {
      setActiveTemplate(preset.id);
      setCurrentTitle(preset.name);
      setHtml(preset.html);
      setCss(preset.css);
      setJs(preset.js);
      setLogs([]);
      showToast(`Loaded "${preset.name}" preset`);
    }
  };

  // Reset to initial preset
  const handleReset = () => {
    handleSelectTemplate(activeTemplate);
  };

  // Save current snippet
  const handleSaveSnippet = async (metadata) => {
    const uid = user?.uid || 'guest';
    const payload = {
      title: metadata.title || currentTitle,
      description: metadata.description || '',
      tags: metadata.tags || [],
      html,
      css,
      js
    };

    try {
      const id = await StorageAdapter.saveSnippet(payload, uid);
      setCurrentTitle(payload.title);
      const updated = await StorageAdapter.getUserSnippets(uid);
      setSavedSnippets(updated);
      showToast(`Saved "${payload.title}" successfully!`);
    } catch (err) {
      showToast(`Error saving snippet: ${err.message}`);
    }
  };

  // Load a saved snippet into editor
  const handleLoadSnippet = (snippet) => {
    setHtml(snippet.html || '');
    setCss(snippet.css || '');
    setJs(snippet.js || '');
    setCurrentTitle(snippet.title || 'Loaded Snippet');
    setLogs([]);
    showToast(`Loaded "${snippet.title}" into editor`);
  };

  // Delete saved snippet
  const handleDeleteSnippet = async (snippetId) => {
    const uid = user?.uid || 'guest';
    try {
      await StorageAdapter.deleteSnippet(snippetId, uid);
      const updated = await StorageAdapter.getUserSnippets(uid);
      setSavedSnippets(updated);
      showToast('Snippet deleted.');
    } catch (err) {
      showToast('Failed to delete snippet.');
    }
  };

  // Export as Standalone HTML
  const handleExportHtml = () => {
    const htmlBundle = exportSnippetAsHtml(currentTitle, html, css, js);
    const blob = new Blob([htmlBundle], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded standalone HTML bundle');
  };

  // Export as Snippet JSON
  const handleExportJson = () => {
    const jsonStr = exportSnippetAsJson({
      title: currentTitle,
      html,
      css,
      js
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded snippet JSON');
  };

  // Import snippet file
  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        try {
          const validated = validateSnippetJson(content);
          setHtml(validated.html);
          setCss(validated.css);
          setJs(validated.js);
          setCurrentTitle(validated.title);
          setLogs([]);
          showToast(`Imported "${validated.title}" successfully`);
        } catch (err) {
          alert('Import Error: ' + err.message);
        }
      } else if (file.name.endsWith('.html')) {
        // Extract style and script if possible, or put in html
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const styleEl = doc.querySelector('style');
          const scriptEl = doc.querySelector('script');
          
          const extractedCss = styleEl ? styleEl.textContent : '';
          const extractedJs = scriptEl ? scriptEl.textContent : '';

          if (styleEl) styleEl.remove();
          if (scriptEl) scriptEl.remove();

          const extractedHtml = doc.body ? doc.body.innerHTML : content;

          setHtml(extractedHtml.trim());
          setCss(extractedCss.trim());
          setJs(extractedJs.trim());
          setCurrentTitle(file.name.replace(/\.[^/.]+$/, ''));
          setLogs([]);
          showToast(`Imported HTML document: "${file.name}"`);
        } catch (err) {
          setHtml(content);
          showToast(`Imported raw HTML from "${file.name}"`);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      {/* Toast banner */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        activeTemplate={activeTemplate}
        onSelectTemplate={handleSelectTemplate}
        onRun={() => compileNow()}
        onReset={handleReset}
        isCompiling={isCompiling}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenSnippetsModal={() => setIsSnippetsModalOpen(true)}
        onExportJson={handleExportJson}
        onExportHtml={handleExportHtml}
        onImportFile={handleImportFile}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isCloudSynced={isCloudSynced}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen(prev => !prev)}
        logCount={logs.length}
      />

      {/* Workspace Area: Editors + Preview */}
      <main className="workspace-main">
        {/* Left Side: Code Editor Panes */}
        <div className="workspace-editor-col">
          <EditorPanes
            html={html}
            css={css}
            js={js}
            onChangeHtml={setHtml}
            onChangeCss={setCss}
            onChangeJs={setJs}
            layoutMode={layoutMode}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onRun={() => compileNow()}
            onSave={() => setIsSaveModalOpen(true)}
          />
        </div>

        {/* Right Side: Live Preview & Virtual Console */}
        <div className="workspace-preview-col">
          <PreviewFrame
            srcDoc={srcDoc}
            isCompiling={isCompiling}
            onRefresh={() => compileNow()}
          />

          <ConsoleOutput
            logs={logs}
            isOpen={isConsoleOpen}
            onClear={() => setLogs([])}
            onClose={() => setIsConsoleOpen(false)}
          />
        </div>
      </main>

      {/* Modals */}
      <SaveSnippetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveSnippet}
        defaultTitle={currentTitle}
      />

      <SavedSnippetsModal
        isOpen={isSnippetsModalOpen}
        onClose={() => setIsSnippetsModalOpen(false)}
        snippets={savedSnippets}
        onLoadSnippet={handleLoadSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onSignInEmail={signInWithEmail}
        onSignUpEmail={signUpWithEmail}
        onSignInGuest={signInAnonymousUser}
        onSignOut={signOutUser}
        isCloudSynced={isCloudSynced}
      />
    </div>
  );
}
