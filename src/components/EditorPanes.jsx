import React, { useRef } from 'react';
import { Copy, Trash2, Check, Code2, Palette, FileCode } from 'lucide-react';

function SingleEditor({
  title,
  icon: Icon,
  badge,
  badgeColor,
  value,
  onChange,
  onKeyDown,
  placeholder
}) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef(null);

  const lines = (value || '').split('\n');
  const lineCount = lines.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    onChange('');
    textareaRef.current?.focus();
  };

  const handleLocalKeyDown = (e) => {
    // Tab key handling: insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const target = e.target;
      const start = target.selectionStart;
      const currentLine = value.substring(0, start).split('\n').pop() || '';
      const matchIndent = currentLine.match(/^\s+/);
      if (matchIndent) {
        e.preventDefault();
        const indent = matchIndent[0];
        const newValue = value.substring(0, start) + '\n' + indent + value.substring(target.selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + indent.length;
        }, 0);
        return;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="single-editor-pane">
      <div className="pane-header">
        <div className="pane-title">
          <Icon size={14} className="pane-icon" style={{ color: badgeColor }} />
          <span>{title}</span>
          <span className="pane-badge" style={{ backgroundColor: `${badgeColor}20`, color: badgeColor }}>
            {badge}
          </span>
        </div>
        <div className="pane-actions">
          <span className="line-stats">{lineCount} lines</span>
          <button 
            className="pane-btn" 
            onClick={handleCopy} 
            title="Copy Code"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          </button>
          <button 
            className="pane-btn" 
            onClick={handleClear} 
            title="Clear Code"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="pane-body">
        {/* Line Numbers */}
        <div className="line-numbers" aria-hidden="true">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </div>

        {/* Textarea Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleLocalKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder={placeholder}
          className="code-textarea"
        />
      </div>
    </div>
  );
}

export function EditorPanes({
  html,
  css,
  js,
  onChangeHtml,
  onChangeCss,
  onChangeJs,
  layoutMode,
  activeTab,
  onSelectTab,
  onRun,
  onSave
}) {
  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onSave();
    }
  };

  if (layoutMode === 'tabs') {
    return (
      <div className="tabbed-editor-container">
        <div className="editor-tabs-bar">
          <button 
            className={`editor-tab ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => onSelectTab('html')}
          >
            <Code2 size={13} color="#f97316" />
            <span>HTML</span>
          </button>
          <button 
            className={`editor-tab ${activeTab === 'css' ? 'active' : ''}`}
            onClick={() => onSelectTab('css')}
          >
            <Palette size={13} color="#38bdf8" />
            <span>CSS</span>
          </button>
          <button 
            className={`editor-tab ${activeTab === 'js' ? 'active' : ''}`}
            onClick={() => onSelectTab('js')}
          >
            <FileCode size={13} color="#facc15" />
            <span>JavaScript</span>
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'html' && (
            <SingleEditor
              title="HTML"
              icon={Code2}
              badge="HTML5"
              badgeColor="#f97316"
              value={html}
              onChange={onChangeHtml}
              onKeyDown={handleKeyDown}
              placeholder="<!-- Write HTML markup here -->"
            />
          )}
          {activeTab === 'css' && (
            <SingleEditor
              title="CSS"
              icon={Palette}
              badge="CSS3"
              badgeColor="#38bdf8"
              value={css}
              onChange={onChangeCss}
              onKeyDown={handleKeyDown}
              placeholder="/* Write CSS styles here */"
            />
          )}
          {activeTab === 'js' && (
            <SingleEditor
              title="JavaScript"
              icon={FileCode}
              badge="ES6+"
              badgeColor="#facc15"
              value={js}
              onChange={onChangeJs}
              onKeyDown={handleKeyDown}
              placeholder="// Write JavaScript code here"
            />
          )}
        </div>
      </div>
    );
  }

  // Split layout (all 3 panes visible side-by-side or columns)
  return (
    <div className="split-editor-container">
      <SingleEditor
        title="HTML"
        icon={Code2}
        badge="HTML5"
        badgeColor="#f97316"
        value={html}
        onChange={onChangeHtml}
        onKeyDown={handleKeyDown}
        placeholder="<!-- Write HTML markup here -->"
      />
      <SingleEditor
        title="CSS"
        icon={Palette}
        badge="CSS3"
        badgeColor="#38bdf8"
        value={css}
        onChange={onChangeCss}
        onKeyDown={handleKeyDown}
        placeholder="/* Write CSS styles here */"
      />
      <SingleEditor
        title="JavaScript"
        icon={FileCode}
        badge="ES6+"
        badgeColor="#facc15"
        value={js}
        onChange={onChangeJs}
        onKeyDown={handleKeyDown}
        placeholder="// Write JavaScript code here"
      />
    </div>
  );
}
