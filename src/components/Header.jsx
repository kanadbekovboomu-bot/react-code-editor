import React, { useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Columns, 
  Layers, 
  User, 
  Terminal, 
  Cloud, 
  CloudOff, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { TEMPLATE_PRESETS } from '../data/templatePresets';

export function Header({
  activeTemplate,
  onSelectTemplate,
  onRun,
  onReset,
  isCompiling,
  layoutMode,
  onChangeLayoutMode,
  onOpenSaveModal,
  onOpenSnippetsModal,
  onExportJson,
  onExportHtml,
  onImportFile,
  user,
  onOpenAuthModal,
  isCloudSynced,
  isConsoleOpen,
  onToggleConsole,
  logCount
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-badge">
          <div className="logo-icon">
            <span>&lt;/&gt;</span>
          </div>
          <div className="logo-text">
            <span className="logo-title">CodeCraft</span>
            <span className="logo-subtitle">Live Sandbox</span>
          </div>
        </div>

        {/* Template Presets Dropdown */}
        <div className="template-picker">
          <Sparkles size={14} className="template-icon" />
          <select 
            value={activeTemplate} 
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="template-select"
            title="Load template preset"
          >
            {TEMPLATE_PRESETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="select-arrow" />
        </div>
      </div>

      <div className="header-center">
        {/* Run & Refresh Actions */}
        <button 
          onClick={onRun}
          className={`btn-action btn-run ${isCompiling ? 'loading' : ''}`}
          title="Run Code (Ctrl + Enter)"
        >
          <Play size={14} fill="currentColor" />
          <span>{isCompiling ? 'Running...' : 'Run'}</span>
          <kbd className="shortcut-hint">Ctrl+↵</kbd>
        </button>

        <button 
          onClick={onReset}
          className="btn-action btn-secondary"
          title="Reset to Template Default"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>

        <div className="header-divider" />

        {/* Layout Switcher */}
        <div className="layout-toggle-group">
          <button 
            className={`btn-toggle ${layoutMode === 'split' ? 'active' : ''}`}
            onClick={() => onChangeLayoutMode('split')}
            title="Split Multi-Pane Layout"
          >
            <Columns size={14} />
            <span className="hide-sm">Split</span>
          </button>
          <button 
            className={`btn-toggle ${layoutMode === 'tabs' ? 'active' : ''}`}
            onClick={() => onChangeLayoutMode('tabs')}
            title="Tabbed Editor Layout"
          >
            <Layers size={14} />
            <span className="hide-sm">Tabs</span>
          </button>
        </div>

        {/* Virtual Console Toggle */}
        <button 
          onClick={onToggleConsole}
          className={`btn-toggle ${isConsoleOpen ? 'active-console' : ''}`}
          title="Toggle Virtual Console"
        >
          <Terminal size={14} />
          <span className="hide-sm">Console</span>
          {logCount > 0 && <span className="console-counter">{logCount}</span>}
        </button>
      </div>

      <div className="header-right">
        {/* Export / Import Menu */}
        <div className="dropdown-wrapper">
          <button 
            className="btn-action btn-secondary"
            onClick={onExportHtml}
            title="Export Standalone HTML Bundle"
          >
            <Download size={14} />
            <span className="hide-sm">HTML</span>
          </button>
          <button 
            className="btn-action btn-secondary"
            onClick={onExportJson}
            title="Export Snippet JSON"
          >
            <Download size={14} />
            <span className="hide-sm">JSON</span>
          </button>
          <button 
            className="btn-action btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Import Snippet File (.json or .html)"
          >
            <Upload size={14} />
            <span className="hide-sm">Import</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".json,.html"
            style={{ display: 'none' }}
          />
        </div>

        <div className="header-divider" />

        {/* Snippets Collection */}
        <button 
          className="btn-action btn-secondary"
          onClick={onOpenSnippetsModal}
          title="Browse Saved Snippets"
        >
          <FolderOpen size={14} />
          <span className="hide-sm">Snippets</span>
        </button>

        <button 
          className="btn-action btn-primary"
          onClick={onOpenSaveModal}
          title="Save Snippet (Ctrl + S)"
        >
          <Save size={14} />
          <span>Save</span>
        </button>

        {/* Auth / Cloud Sync Status */}
        <button 
          className="user-status-pill"
          onClick={onOpenAuthModal}
          title={isCloudSynced ? 'Synced to Cloud Firestore' : 'Offline / Local Demo Mode'}
        >
          {isCloudSynced ? (
            <Cloud size={14} className="sync-icon online" />
          ) : (
            <CloudOff size={14} className="sync-icon offline" />
          )}
          <span className="user-name">
            {user ? (user.displayName || user.email || 'Guest') : 'Sign In'}
          </span>
        </button>
      </div>
    </header>
  );
}
