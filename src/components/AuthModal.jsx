import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  UserCheck, 
  LogOut, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  user,
  onSignInEmail,
  onSignUpEmail,
  onSignInGuest,
  onSignOut,
  isCloudSynced
}) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signin') {
        await onSignInEmail(email, password);
      } else {
        await onSignUpEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await onSignInGuest();
      onClose();
    } catch (err) {
      setError(err.message || 'Guest sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await onSignOut();
      onClose();
    } catch (err) {
      setError(err.message || 'Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <UserCheck size={16} className="modal-icon" />
            <span>Account & Sync</span>
          </div>
          <button className="pane-btn" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>

        <div className="auth-status-banner">
          <div className="sync-indicator">
            <span className={`status-dot ${isCloudSynced ? 'live' : 'offline'}`} />
            <span className="status-label">
              {isCloudSynced ? 'Firebase Cloud Connected' : 'Offline / Local Demo Mode'}
            </span>
          </div>
          <span className="sync-hint">
            {isCloudSynced 
              ? 'Snippets are securely backed up in Cloud Firestore.' 
              : 'Operating with local browser storage. All features are 100% available offline.'}
          </span>
        </div>

        {user ? (
          <div className="logged-in-view">
            <div className="user-profile-box">
              <div className="profile-avatar">
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              <div className="profile-details">
                <span className="profile-name">{user.displayName || 'Guest User'}</span>
                <span className="profile-email">{user.email || 'Anonymous Guest Session'}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-action btn-danger full-width"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
                onClick={() => { setTab('signin'); setError(''); }}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
              <button
                className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => { setTab('signup'); setError(''); }}
              >
                <UserPlus size={13} />
                <span>Sign Up</span>
              </button>
            </div>

            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                className="btn-action btn-primary full-width"
                disabled={loading}
              >
                {tab === 'signin' ? <LogIn size={14} /> : <UserPlus size={14} />}
                <span>{loading ? 'Authenticating...' : (tab === 'signin' ? 'Sign In' : 'Create Account')}</span>
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn-action btn-secondary full-width guest-btn"
              onClick={handleGuestLogin}
              disabled={loading}
            >
              <Sparkles size={14} color="#38bdf8" />
              <span>Continue as Guest (Anonymous)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
