import React, { useState } from 'react';
import { X, Save, Tag } from 'lucide-react';

export function SaveSnippetModal({
  isOpen,
  onClose,
  onSave,
  defaultTitle
}) {
  const [title, setTitle] = useState(defaultTitle || 'My Web Project');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('HTML, CSS, JS');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      tags
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Save size={16} className="modal-icon" />
            <span>Save Snippet</span>
          </div>
          <button className="pane-btn" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Snippet Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Interactive Card Gallery"
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this code does..."
              className="form-textarea"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. animation, button, flexbox"
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-action btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-action btn-primary">
              <Save size={14} />
              <span>Save Snippet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
