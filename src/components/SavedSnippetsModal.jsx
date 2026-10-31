import React, { useState } from 'react';
import { X, FolderOpen, Play, Trash2, Search, Calendar, Tag } from 'lucide-react';

export function SavedSnippetsModal({
  isOpen,
  onClose,
  snippets,
  onLoadSnippet,
  onDeleteSnippet
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredSnippets = snippets.filter(s => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(term);
    const descMatch = (s.description || '').toLowerCase().includes(term);
    const tagMatch = (s.tags || []).some(t => t.toLowerCase().includes(term));
    return titleMatch || descMatch || tagMatch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FolderOpen size={16} className="modal-icon" />
            <span>Saved Snippets Library</span>
            <span className="modal-badge">{snippets.length}</span>
          </div>
          <button className="pane-btn" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>

        <div className="modal-search-row">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search saved snippets by title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input modal-search-input"
            autoFocus
          />
        </div>

        <div className="snippets-list-container">
          {filteredSnippets.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={32} className="empty-icon" />
              <p>No snippets found</p>
              <span>Save your code or create one to see it listed here.</span>
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <div key={snippet.id} className="snippet-item-card">
                <div className="snippet-info">
                  <h4 className="snippet-title">{snippet.title}</h4>
                  {snippet.description && (
                    <p className="snippet-desc">{snippet.description}</p>
                  )}
                  <div className="snippet-meta">
                    <span className="snippet-date">
                      <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {formatDate(snippet.updatedAt || snippet.createdAt)}
                    </span>
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="snippet-tags">
                        {snippet.tags.map((tag, i) => (
                          <span key={i} className="snippet-tag">
                            <Tag size={9} style={{ display: 'inline', marginRight: 3 }} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="snippet-actions">
                  <button 
                    className="btn-action btn-primary small-btn"
                    onClick={() => {
                      onLoadSnippet(snippet);
                      onClose();
                    }}
                    title="Load into Editor"
                  >
                    <Play size={12} />
                    <span>Load</span>
                  </button>
                  <button 
                    className="btn-action btn-danger small-btn"
                    onClick={() => onDeleteSnippet(snippet.id)}
                    title="Delete Snippet"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
