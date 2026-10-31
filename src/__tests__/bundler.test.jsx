import { describe, it, expect } from 'vitest';
import {
  escapeScriptTags,
  buildSandboxDocument,
  exportSnippetAsHtml,
  exportSnippetAsJson,
  validateSnippetJson
} from '../utils/bundler';
import {
  parseConsoleMessage,
  filterLogs
} from '../utils/consoleParser';

describe('Document Bundler Tests', () => {
  it('escapes closing script tags correctly inside user code', () => {
    const dangerousCode = 'const x = "</script><script>alert(1)</script>";';
    const escaped = escapeScriptTags(dangerousCode);
    expect(escaped).not.toContain('</script>');
    expect(escaped).toContain('<\\/script>');
  });

  it('assembles a full HTML sandbox document with styles, markup, and scripts', () => {
    const html = '<div id="test">Hello World</div>';
    const css = '#test { color: red; }';
    const js = 'console.log("hello from test");';

    const doc = buildSandboxDocument(html, css, js);

    expect(doc).toContain('<!DOCTYPE html>');
    expect(doc).toContain('<meta charset="UTF-8">');
    expect(doc).toContain('#test { color: red; }');
    expect(doc).toContain('<div id="test">Hello World</div>');
    expect(doc).toContain('console.log("hello from test");');
    expect(doc).toContain('CONSOLE_LOG');
  });

  it('embeds console proxy and runtime error wrappers', () => {
    const doc = buildSandboxDocument('', '', 'let a = 10;');
    expect(doc).toContain('window.onerror');
    expect(doc).toContain('unhandledrejection');
    expect(doc).toContain('postMessage');
    expect(doc).toContain('try {');
    expect(doc).toContain('catch (runtimeError)');
  });

  it('exports snippet as a valid standalone HTML document', () => {
    const title = 'Demo Component';
    const html = '<button id="btn">Click</button>';
    const css = 'button { background: blue; }';
    const js = 'document.getElementById("btn").click();';

    const standalone = exportSnippetAsHtml(title, html, css, js);

    expect(standalone).toContain('<!DOCTYPE html>');
    expect(standalone).toContain(`<title>${title}</title>`);
    expect(standalone).toContain(html);
    expect(standalone).toContain(css);
    expect(standalone).toContain(js);
  });
});

describe('Console Parser & Message Interceptor Tests', () => {
  it('parses valid CONSOLE_LOG events into structured entries', () => {
    const eventData = {
      type: 'CONSOLE_LOG',
      level: 'log',
      args: ['User logged in:', 'admin'],
      timestamp: 1700000000000
    };

    const parsed = parseConsoleMessage(eventData);

    expect(parsed).not.toBeNull();
    expect(parsed.level).toBe('log');
    expect(parsed.args).toEqual(['User logged in:', 'admin']);
    expect(parsed.text).toBe('User logged in: admin');
    expect(parsed.timeFormatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('rejects invalid or foreign message events', () => {
    expect(parseConsoleMessage(null)).toBeNull();
    expect(parseConsoleMessage(undefined)).toBeNull();
    expect(parseConsoleMessage('string-message')).toBeNull();
    expect(parseConsoleMessage({ type: 'OTHER_ACTION' })).toBeNull();
  });

  it('normalizes unsupported log levels to log', () => {
    const eventData = {
      type: 'CONSOLE_LOG',
      level: 'unknown_custom_level',
      args: ['Warning test']
    };
    const parsed = parseConsoleMessage(eventData);
    expect(parsed.level).toBe('log');
  });

  it('filters logs by level correctly', () => {
    const logs = [
      { id: '1', level: 'log', text: 'App mounted' },
      { id: '2', level: 'warn', text: 'Low memory' },
      { id: '3', level: 'error', text: 'Failed to fetch resource' },
      { id: '4', level: 'log', text: 'Rendering done' }
    ];

    const errorOnly = filterLogs(logs, { filterLevel: 'error' });
    expect(errorOnly).toHaveLength(1);
    expect(errorOnly[0].id).toBe('3');

    const logOnly = filterLogs(logs, { filterLevel: 'log' });
    expect(logOnly).toHaveLength(2);

    const all = filterLogs(logs, { filterLevel: 'all' });
    expect(all).toHaveLength(4);
  });

  it('filters logs by search query across text', () => {
    const logs = [
      { id: '1', level: 'log', text: 'Connecting to database' },
      { id: '2', level: 'warn', text: 'Cache miss on key user:42' },
      { id: '3', level: 'error', text: 'Database connection timeout' }
    ];

    const results = filterLogs(logs, { searchQuery: 'database' });
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id)).toEqual(['1', '3']);
  });
});

describe('Snippet Export & Import Schema Validation Tests', () => {
  it('exports snippet to JSON adhering to schema', () => {
    const snippet = {
      title: 'Counter App',
      description: 'Simple counter',
      html: '<div>0</div>',
      css: 'div { color: white; }',
      js: 'console.log(1);',
      tags: ['demo']
    };

    const jsonStr = exportSnippetAsJson(snippet);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.version).toBe(1);
    expect(parsed.title).toBe('Counter App');
    expect(parsed.html).toBe('<div>0</div>');
    expect(parsed.css).toBe('div { color: white; }');
    expect(parsed.js).toBe('console.log(1);');
    expect(parsed.tags).toEqual(['demo']);
    expect(typeof parsed.createdAt).toBe('number');
    expect(typeof parsed.updatedAt).toBe('number');
  });

  it('validates and parses valid snippet JSON string', () => {
    const rawJson = JSON.stringify({
      title: 'Valid Snippet',
      html: '<h1>Hi</h1>',
      css: 'h1 { margin: 0; }',
      js: 'alert("hi");'
    });

    const validated = validateSnippetJson(rawJson);
    expect(validated.title).toBe('Valid Snippet');
    expect(validated.html).toBe('<h1>Hi</h1>');
    expect(validated.css).toBe('h1 { margin: 0; }');
    expect(validated.js).toBe('alert("hi");');
  });

  it('throws descriptive error on invalid or empty JSON', () => {
    expect(() => validateSnippetJson('')).toThrow('Snippet input cannot be empty.');
    expect(() => validateSnippetJson('{ not valid json')).toThrow('Invalid JSON format:');
  });

  it('throws descriptive error on JSON missing all code fields', () => {
    const invalidObj = { title: 'No Code Here', description: 'Just text' };
    expect(() => validateSnippetJson(invalidObj)).toThrow('Invalid snippet: Must contain at least one code field');
  });
});
