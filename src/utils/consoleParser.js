/**
 * consoleParser.js
 * Parses and manages virtual console messages intercepted from the preview iframe
 */

let logCounter = 0;

/**
 * Parses incoming message event data into a standardized virtual console entry.
 * @param {any} eventData 
 * @returns {object|null}
 */
export function parseConsoleMessage(eventData) {
  if (!eventData || typeof eventData !== 'object') {
    return null;
  }

  if (eventData.type !== 'CONSOLE_LOG') {
    return null;
  }

  const validLevels = ['log', 'warn', 'error', 'info', 'debug'];
  const level = validLevels.includes(eventData.level) ? eventData.level : 'log';
  const rawArgs = Array.isArray(eventData.args) ? eventData.args : [String(eventData.args || '')];

  logCounter += 1;
  const timestamp = typeof eventData.timestamp === 'number' ? eventData.timestamp : Date.now();
  const dateObj = new Date(timestamp);
  const timeFormatted = [
    String(dateObj.getHours()).padStart(2, '0'),
    String(dateObj.getMinutes()).padStart(2, '0'),
    String(dateObj.getSeconds()).padStart(2, '0')
  ].join(':');

  const text = rawArgs.join(' ');

  return {
    id: `log_${timestamp}_${logCounter}`,
    level,
    args: rawArgs,
    text,
    timestamp,
    timeFormatted
  };
}

/**
 * Filters console log entries based on selected level filter and search query.
 * @param {Array<object>} logs 
 * @param {object} criteria
 * @param {string} [criteria.filterLevel='all'] 'all' | 'log' | 'warn' | 'error' | 'info'
 * @param {string} [criteria.searchQuery='']
 * @returns {Array<object>}
 */
export function filterLogs(logs = [], { filterLevel = 'all', searchQuery = '' } = {}) {
  if (!Array.isArray(logs)) return [];

  const query = searchQuery.trim().toLowerCase();

  return logs.filter(item => {
    if (!item || typeof item !== 'object') return false;

    // Level match
    if (filterLevel !== 'all' && item.level !== filterLevel) {
      return false;
    }

    // Search query match
    if (query) {
      const matchText = (item.text || '').toLowerCase().includes(query);
      const matchLevel = (item.level || '').toLowerCase().includes(query);
      if (!matchText && !matchLevel) {
        return false;
      }
    }

    return true;
  });
}
