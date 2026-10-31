/**
 * bundler.js
 * Core document bundler for sandboxed live execution in CodeCraft Sandbox
 */

/**
 * Escapes closing script tags inside user JavaScript to prevent breaking <script> containers.
 * @param {string} code 
 * @returns {string}
 */
export function escapeScriptTags(code) {
  if (typeof code !== 'string') return '';
  return code.replace(/<\/script/gi, '<\\/script');
}

/**
 * Builds the complete standalone sandboxed HTML srcdoc string.
 * @param {string} html User HTML
 * @param {string} css User CSS
 * @param {string} js User JS
 * @param {object} [options]
 * @returns {string} Fully assembled HTML document
 */
export function buildSandboxDocument(html = '', css = '', js = '', options = {}) {
  const safeJs = escapeScriptTags(js);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    /* Reset & Base Sandbox Styles */
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    /* User Styles */
    ${css || ''}
  </style>
  <script>
    (function() {
      // Safe circular-reference argument serializer
      function serializeArg(arg) {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
        if (typeof arg === 'function') return '[Function: ' + (arg.name || 'anonymous') + ']';
        if (arg instanceof Error) return arg.stack || (arg.name + ': ' + arg.message);
        if (typeof Element !== 'undefined' && arg instanceof Element) {
          const id = arg.id ? '#' + arg.id : '';
          const cls = arg.className ? '.' + String(arg.className).trim().split(/\\s+/).join('.') : '';
          return '<' + arg.tagName.toLowerCase() + id + cls + '>';
        }

        const seen = new WeakSet();
        try {
          return JSON.stringify(arg, function(key, val) {
            if (typeof val === 'object' && val !== null) {
              if (seen.has(val)) return '[Circular]';
              seen.add(val);
            }
            if (typeof val === 'function') return '[Function]';
            return val;
          }, 2);
        } catch (e) {
          return String(arg);
        }
      }

      function sendToParent(level, args) {
        try {
          const serializedArgs = args.map(serializeArg);
          window.parent.postMessage({
            type: 'CONSOLE_LOG',
            level: level,
            args: serializedArgs,
            timestamp: Date.now()
          }, '*');
        } catch (err) {
          // Fallback if postMessage fails
        }
      }

      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;
      const origInfo = console.info || origLog;
      const origDebug = console.debug || origLog;

      console.log = function(...args) {
        sendToParent('log', args);
        if (origLog) origLog.apply(console, args);
      };
      console.warn = function(...args) {
        sendToParent('warn', args);
        if (origWarn) origWarn.apply(console, args);
      };
      console.error = function(...args) {
        sendToParent('error', args);
        if (origError) origError.apply(console, args);
      };
      console.info = function(...args) {
        sendToParent('info', args);
        if (origInfo) origInfo.apply(console, args);
      };
      console.debug = function(...args) {
        sendToParent('debug', args);
        if (origDebug) origDebug.apply(console, args);
      };

      // Catch global unhandled runtime errors
      window.onerror = function(message, source, lineno, colno, error) {
        const errorDetails = error && error.stack ? error.stack : 'Error (' + lineno + ':' + colno + '): ' + message;
        sendToParent('error', [errorDetails]);
        return false;
      };

      // Catch unhandled Promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason;
        const msg = reason instanceof Error ? (reason.stack || reason.message) : String(reason);
        sendToParent('error', ['Unhandled Promise Rejection: ' + msg]);
      });
    })();
  </script>
</head>
<body>
  ${html || ''}
  <script>
    try {
      ${safeJs}
    } catch (runtimeError) {
      console.error(runtimeError.stack || runtimeError.message);
    }
  </script>
</body>
</html>`;
}

/**
 * Exports snippet into a self-contained single HTML bundle ready for offline viewing.
 * @param {string} title 
 * @param {string} html 
 * @param {string} css 
 * @param {string} js 
 * @returns {string}
 */
export function exportSnippetAsHtml(title = 'Snippet', html = '', css = '', js = '') {
  const safeJs = escapeScriptTags(js);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    ${css || ''}
  </style>
</head>
<body>
  ${html || ''}
  <script>
    try {
      ${safeJs}
    } catch (e) {
      console.error(e);
    }
  </script>
</body>
</html>`;
}

/**
 * Validates and serializes snippet metadata to standard JSON format.
 * @param {object} snippet 
 * @returns {string} JSON string
 */
export function exportSnippetAsJson(snippet = {}) {
  const payload = {
    version: 1,
    title: snippet.title || 'Untitled Snippet',
    description: snippet.description || '',
    html: typeof snippet.html === 'string' ? snippet.html : '',
    css: typeof snippet.css === 'string' ? snippet.css : '',
    js: typeof snippet.js === 'string' ? snippet.js : '',
    tags: Array.isArray(snippet.tags) ? snippet.tags : [],
    createdAt: snippet.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates incoming JSON string or object against snippet schema.
 * @param {string|object} input 
 * @returns {object} validated snippet payload
 * @throws {Error} if validation fails
 */
export function validateSnippetJson(input) {
  if (!input) {
    throw new Error('Snippet input cannot be empty.');
  }

  let parsed = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      throw new Error('Invalid JSON format: ' + err.message);
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid snippet: Expected an object structure.');
  }

  // Must have at least html, css, or js as string
  const hasCodeField = typeof parsed.html === 'string' || typeof parsed.css === 'string' || typeof parsed.js === 'string';
  if (!hasCodeField) {
    throw new Error('Invalid snippet: Must contain at least one code field ("html", "css", or "js").');
  }

  return {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : 'Imported Snippet',
    description: typeof parsed.description === 'string' ? parsed.description : '',
    html: typeof parsed.html === 'string' ? parsed.html : '',
    css: typeof parsed.css === 'string' ? parsed.css : '',
    js: typeof parsed.js === 'string' ? parsed.js : '',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    updatedAt: Date.now()
  };
}
