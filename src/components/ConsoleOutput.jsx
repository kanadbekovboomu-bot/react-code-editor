import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Search, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2 
} from 'lucide-react';
import { filterLogs } from '../utils/consoleParser';

export function ConsoleOutput({
  logs,
  onClear,
  onClose,
  isOpen
}) {
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = filterLogs(logs, { filterLevel, searchQuery });

  const countErrors = logs.filter(l => l.level === 'error').length;
  const countWarns = logs.filter(l => l.level === 'warn').length;
  const countLogs = logs.filter(l => l.level === 'log').length;

  const getBadgeIcon = (level) => {
    switch (level) {
      case 'error': return <AlertCircle size={12} color="#f43f5e" />;
      case 'warn': return <AlertTriangle size={12} color="#f59e0b" />;
      case 'info': return <Info size={12} color="#38bdf8" />;
      default: return <CheckCircle2 size={12} color="#94a3b8" />;
    }
  };

  return (
    <div className="virtual-console-panel">
      <div className="console-header">
        <div className="console-title">
          <Terminal size={14} className="console-icon" />
          <span>Console Output</span>
          <span className="console-badge">{logs.length}</span>
        </div>

        {/* Filter Pills */}
        <div className="console-filters">
          <button 
            className={`console-filter-btn ${filterLevel === 'all' ? 'active' : ''}`}
            onClick={() => setFilterLevel('all')}
          >
            All ({logs.length})
          </button>
          <button 
            className={`console-filter-btn ${filterLevel === 'log' ? 'active' : ''}`}
            onClick={() => setFilterLevel('log')}
          >
            Logs ({countLogs})
          </button>
          <button 
            className={`console-filter-btn warn ${filterLevel === 'warn' ? 'active' : ''}`}
            onClick={() => setFilterLevel('warn')}
          >
            Warns ({countWarns})
          </button>
          <button 
            className={`console-filter-btn error ${filterLevel === 'error' ? 'active' : ''}`}
            onClick={() => setFilterLevel('error')}
          >
            Errors ({countErrors})
          </button>
        </div>

        {/* Search Input */}
        <div className="console-search-box">
          <Search size={12} className="search-icon" />
          <input
            type="text"
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="console-search-input"
          />
        </div>

        <div className="console-actions">
          <button 
            className="pane-btn" 
            onClick={onClear} 
            title="Clear Console"
          >
            <Trash2 size={12} />
            <span className="hide-sm">Clear</span>
          </button>
          <button 
            className="pane-btn" 
            onClick={onClose} 
            title="Close Console Panel"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="console-body">
        {filteredLogs.length === 0 ? (
          <div className="console-empty">
            <Terminal size={24} className="empty-icon" />
            <p>Console is clean.</p>
            <span className="empty-subtext">Output from console.log(), console.warn(), and runtime errors will display here.</span>
          </div>
        ) : (
          <div className="console-log-list">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`console-log-row log-${log.level}`}>
                <span className="log-time">{log.timeFormatted}</span>
                <span className="log-badge-wrapper" title={log.level.toUpperCase()}>
                  {getBadgeIcon(log.level)}
                  <span className="log-level-tag">{log.level.toUpperCase()}</span>
                </span>
                <div className="log-content">
                  {log.args.map((arg, idx) => (
                    <span key={idx} className="log-arg">
                      {typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
