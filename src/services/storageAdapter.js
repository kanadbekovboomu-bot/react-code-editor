/**
 * storageAdapter.js
 * Resilient storage adapter supporting Cloud Firestore with transparent LocalStorage offline fallback
 */

import { getFirebaseDb, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, orderBy } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'code_craft_snippets_v1';

// Initial preloaded seed snippets for local demo mode
const SEED_SNIPPETS = [
  {
    id: 'seed-counter-demo',
    userId: 'demo-guest',
    title: 'Reactive Counter Template',
    description: 'Preloaded sample snippet',
    html: `<div style="text-align:center; padding: 40px; font-family: sans-serif;">
  <h2 style="color: #38bdf8;">Quick Start Counter</h2>
  <h1 id="count" style="font-size: 48px; margin: 16px 0;">0</h1>
  <button id="btn" style="padding: 10px 24px; font-weight: bold; background: #38bdf8; border: none; border-radius: 8px; cursor: pointer;">Click Me</button>
</div>`,
    css: `body { background: #111827; color: #f9fafb; margin: 0; }`,
    js: `let count = 0;
const countEl = document.getElementById('count');
document.getElementById('btn').addEventListener('click', () => {
  count++;
  countEl.textContent = count;
  console.log('Count incremented to:', count);
});`,
    tags: ['Demo', 'Starter'],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  }
];

/**
 * Loads snippets stored locally in browser localStorage
 * @returns {Array<object>}
 */
function getLocalSnippets() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_SNIPPETS));
      return [...SEED_SNIPPETS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse local snippets, falling back to seeds:', err);
    return [...SEED_SNIPPETS];
  }
}

/**
 * Saves snippets to localStorage
 * @param {Array<object>} snippets 
 */
function setLocalSnippets(snippets) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snippets));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

export const StorageAdapter = {
  /**
   * Saves or updates a snippet
   * @param {object} snippet 
   * @param {string} userId 
   * @returns {Promise<string>} snippet ID
   */
  async saveSnippet(snippet, userId = 'guest') {
    const id = snippet.id || `snip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const snippetDoc = {
      id,
      userId,
      title: snippet.title || 'Untitled Snippet',
      description: snippet.description || '',
      html: snippet.html || '',
      css: snippet.css || '',
      js: snippet.js || '',
      tags: snippet.tags || [],
      createdAt: snippet.createdAt || now,
      updatedAt: now
    };

    // Attempt Firestore persistence first if configured
    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const docRef = doc(db, 'code_snippets', id);
          await setDoc(docRef, snippetDoc, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore write failed, saving to local fallback:', err);
      }
    }

    // Always mirror in localStorage for resilient offline experience
    const local = getLocalSnippets();
    const existingIndex = local.findIndex(s => s.id === id);
    if (existingIndex >= 0) {
      local[existingIndex] = snippetDoc;
    } else {
      local.unshift(snippetDoc);
    }
    setLocalSnippets(local);

    return id;
  },

  /**
   * Retrieves snippets belonging to the user
   * @param {string} userId 
   * @returns {Promise<Array<object>>}
   */
  async getUserSnippets(userId = 'guest') {
    // Attempt Firestore retrieval
    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const snippetsCol = collection(db, 'code_snippets');
          const q = query(
            snippetsCol,
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
          );
          const snap = await getDocs(q);
          const results = [];
          snap.forEach(d => results.push(d.data()));
          if (results.length > 0) {
            return results;
          }
        }
      } catch (err) {
        console.warn('Firestore query failed, loading from local fallback:', err);
      }
    }

    // Fallback: LocalStorage
    const local = getLocalSnippets();
    return local.filter(s => s.userId === userId || s.userId === 'demo-guest');
  },

  /**
   * Deletes a snippet by ID
   * @param {string} snippetId 
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  async deleteSnippet(snippetId, userId) {
    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const docRef = doc(db, 'code_snippets', snippetId);
          await deleteDoc(docRef);
        }
      } catch (err) {
        console.warn('Firestore delete failed, deleting locally:', err);
      }
    }

    const local = getLocalSnippets();
    const updated = local.filter(s => s.id !== snippetId);
    setLocalSnippets(updated);
    return true;
  }
};
