import React, { useState } from 'react';
import { RefreshCw, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

export function PreviewFrame({
  srcDoc,
  isCompiling,
  onRefresh
}) {
  const [deviceMode, setDeviceMode] = useState('full'); // 'full' | 'tablet' | 'mobile'

  const getContainerWidth = () => {
    if (deviceMode === 'mobile') return '375px';
    if (deviceMode === 'tablet') return '768px';
    return '100%';
  };

  const handleOpenNewWindow = () => {
    const win = window.open();
    if (win) {
      win.document.open();
      win.document.write(srcDoc);
      win.document.close();
    }
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <div className="preview-status">
          <span className={`status-dot ${isCompiling ? 'compiling' : 'live'}`} />
          <span className="status-text">{isCompiling ? 'Compiling...' : 'Live Preview'}</span>
        </div>

        {/* Viewport Dimension Switcher */}
        <div className="viewport-toggles">
          <button 
            className={`viewport-btn ${deviceMode === 'full' ? 'active' : ''}`}
            onClick={() => setDeviceMode('full')}
            title="Desktop / Full Width"
          >
            <Monitor size={13} />
          </button>
          <button 
            className={`viewport-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
            onClick={() => setDeviceMode('tablet')}
            title="Tablet (768px)"
          >
            <Tablet size={13} />
          </button>
          <button 
            className={`viewport-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setDeviceMode('mobile')}
            title="Mobile (375px)"
          >
            <Smartphone size={13} />
          </button>
        </div>

        <div className="preview-actions">
          <button 
            className="pane-btn" 
            onClick={onRefresh} 
            title="Reload Preview Frame"
          >
            <RefreshCw size={12} className={isCompiling ? 'spin' : ''} />
          </button>
          <button 
            className="pane-btn" 
            onClick={handleOpenNewWindow} 
            title="Open Preview in New Window"
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      <div className="preview-body">
        <div 
          className="preview-viewport-wrapper" 
          style={{ width: getContainerWidth() }}
        >
          <iframe
            title="Preview Output"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-modals"
            className="preview-iframe"
          />
        </div>
      </div>
    </div>
  );
}
