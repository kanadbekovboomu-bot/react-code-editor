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

describe('Adversarial Stress Tests - Code Editor & Bundler', () => {
  describe('Script Tag Escaping & Sandbox Assembly', () => {
    it('escapes closing script tags across various cases, spacings, and attributes', () => {
      const payloads = [
        '</script>',
        '</SCRIPT>',
        '</script >',
        '</Script foo="bar">',
        'const a = "</script>"; const b = "</SCRIPT>";',
      ];

      payloads.forEach(code => {
        const escaped = escapeScriptTags(code);
        expect(escaped).not.toMatch(/<\/script/i);
        expect(escaped).toContain('<\\/script');
      });
    });

    it('handles non-string inputs safely in escapeScriptTags', () => {
      expect(escapeScriptTags(null)).toBe('');
      expect(escapeScriptTags(undefined)).toBe('');
      expect(escapeScriptTags(123)).toBe('');
      expect(escapeScriptTags({})).toBe('');
    });

    it('embeds escaped scripts in buildSandboxDocument and exportSnippetAsHtml', () => {
      const maliciousJs = 'alert("xss"); </script><script>alert("injected");</script>';
      const sandboxDoc = buildSandboxDocument('<div>Test</div>', 'div { color: red; }', maliciousJs);
      expect(sandboxDoc).not.toContain('</script><script>alert("injected")');
      expect(sandboxDoc).toContain('<\\/script>');

      const exportedHtml = exportSnippetAsHtml('Title', '<div>Test</div>', '', maliciousJs);
      expect(exportedHtml).not.toContain('</script><script>alert("injected")');
      expect(exportedHtml).toContain('<\\/script>');
    });
  });

  describe('Circular Object Serialization in Sandbox Template', () => {
    // Extract the serializeArg function from bundler document template to stress-test it in isolation
    const doc = buildSandboxDocument();
    const serializeFnMatch = doc.match(/function serializeArg\(arg\) \{([\s\S]*?)\n      \}/);
    expect(serializeFnMatch).not.toBeNull();
    const serializeArg = new Function('arg', serializeFnMatch[1]);

    it('serializes directly circular objects with [Circular] token without stack overflow', () => {
      const circular = {};
      circular.self = circular;

      const result = serializeArg(circular);
      expect(result).toContain('[Circular]');
      expect(result).not.toContain('Maximum call stack');
    });

    it('serializes indirectly circular references (A -> B -> C -> A)', () => {
      const a = { name: 'A' };
      const b = { name: 'B', a };
      const c = { name: 'C', b };
      a.c = c;

      const result = serializeArg(a);
      expect(result).toContain('[Circular]');
    });

    it('serializes circular arrays safely', () => {
      const arr = [1, 2];
      arr.push(arr);

      const result = serializeArg(arr);
      expect(result).toContain('[Circular]');
    });

    it('handles BigInt values safely without crashing on JSON.stringify', () => {
      const bigIntVal = 9007199254740991000n;
      // In JS, JSON.stringify(100n) throws TypeError. serializeArg catches it and returns String(arg)
      const res = serializeArg(bigIntVal);
      expect(res).toBe('9007199254740991000');
    });

    it('handles functions, Errors, and primitives in serializer', () => {
      expect(serializeArg(null)).toBe('null');
      expect(serializeArg(undefined)).toBe('undefined');
      expect(serializeArg(123)).toBe('123');
      expect(serializeArg(true)).toBe('true');
      expect(serializeArg('string')).toBe('string');
      expect(serializeArg(function customFunc() {})).toContain('[Function: customFunc]');
      expect(serializeArg(new Error('Fatal error'))).toContain('Fatal error');
    });

    it('handles objects with throwing property getters without crashing', () => {
      const evilObj = {
        get boom() {
          throw new Error('Getter failed catastrophically');
        }
      };
      const res = serializeArg(evilObj);
      expect(typeof res).toBe('string');
    });
  });

  describe('Corrupted Snippet JSON Imports & Schema Stress', () => {
    it('rejects empty, null, or whitespace-only inputs', () => {
      expect(() => validateSnippetJson('')).toThrow(/cannot be empty/);
      expect(() => validateSnippetJson(null)).toThrow(/cannot be empty/);
      expect(() => validateSnippetJson(undefined)).toThrow(/cannot be empty/);
      expect(() => validateSnippetJson('   ')).toThrow(/Invalid JSON format/);
    });

    it('rejects malformed syntax JSON strings', () => {
      expect(() => validateSnippetJson('{ broken')).toThrow(/Invalid JSON format/);
      expect(() => validateSnippetJson('{ "html": <unquoted> }')).toThrow(/Invalid JSON format/);
    });

    it('rejects non-object JSON payloads (primitives, arrays)', () => {
      expect(() => validateSnippetJson('123')).toThrow(/Expected an object structure/);
      expect(() => validateSnippetJson('true')).toThrow(/Expected an object structure/);
      expect(() => validateSnippetJson('null')).toThrow(/Expected an object structure/);
      expect(() => validateSnippetJson('["html", "css"]')).toThrow(/Expected an object structure/);
      expect(() => validateSnippetJson([])).toThrow(/Expected an object structure/);
    });

    it('rejects objects that do not contain any code fields (html, css, js)', () => {
      expect(() => validateSnippetJson({})).toThrow(/Must contain at least one code field/);
      expect(() => validateSnippetJson({ title: 'Just a title', tags: ['css'] })).toThrow(/Must contain at least one code field/);
      expect(() => validateSnippetJson({ html: 12345 })).toThrow(/Must contain at least one code field/);
    });

    it('sanitizes and applies defaults when fields are omitted or malformed', () => {
      const validPartial = {
        html: '<p>Only HTML</p>',
        title: '   ', // All whitespace title
        tags: 'not-an-array', // Malformed tags
        createdAt: 'invalid-date'
      };

      const result = validateSnippetJson(validPartial);
      expect(result.title).toBe('Imported Snippet'); // Defaulted
      expect(result.html).toBe('<p>Only HTML</p>');
      expect(result.css).toBe('');
      expect(result.js).toBe('');
      expect(result.tags).toEqual([]); // Fallback to array
      expect(typeof result.createdAt).toBe('number');
      expect(typeof result.updatedAt).toBe('number');
    });

    it('neutralizes prototype pollution payloads', () => {
      const pollutionPayload = JSON.parse('{"__proto__": {"polluted": true}, "html": "<b>Clean</b>"}');
      const validated = validateSnippetJson(pollutionPayload);
      expect(validated.html).toBe('<b>Clean</b>');
      expect(({}).polluted).toBeUndefined(); // Prototype not poisoned
    });
  });

  describe('Console Parser Edge Cases & Vulnerabilities', () => {
    it('handles foreign or corrupted eventData safely', () => {
      expect(parseConsoleMessage(null)).toBeNull();
      expect(parseConsoleMessage(undefined)).toBeNull();
      expect(parseConsoleMessage('string')).toBeNull();
      expect(parseConsoleMessage({ type: 'RANDOM_EVENT' })).toBeNull();
    });

    it('normalizes arbitrary or missing levels to "log"', () => {
      const res = parseConsoleMessage({
        type: 'CONSOLE_LOG',
        level: 'UNKNOWN_CRITICAL',
        args: ['hello']
      });
      expect(res.level).toBe('log');
    });

    it('handles non-array or null args safely', () => {
      const res1 = parseConsoleMessage({
        type: 'CONSOLE_LOG',
        args: null
      });
      expect(res1.args).toEqual(['']);
      expect(res1.text).toBe('');

      const res2 = parseConsoleMessage({
        type: 'CONSOLE_LOG',
        args: 'Direct string arg'
      });
      expect(res2.args).toEqual(['Direct string arg']);
    });

    it('handles NaN timestamp safely without throwing', () => {
      const res = parseConsoleMessage({
        type: 'CONSOLE_LOG',
        timestamp: NaN
      });
      expect(res).toBeDefined();
      expect(res.timeFormatted).toBe('NaN:NaN:NaN');
    });

    it('stress-tests filterLogs with corrupted arrays containing null/undefined entries', () => {
      const logsWithHoles = [
        { id: '1', level: 'log', text: 'Valid 1' },
        null,
        undefined,
        'corrupted string entry',
        12345,
        { id: '2', level: 'error', text: 'Valid 2' }
      ];

      // Hardened filterLogs ignores non-object entries cleanly without throwing TypeError
      const res = filterLogs(logsWithHoles, { filterLevel: 'log' });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');

      const resAll = filterLogs(logsWithHoles, { filterLevel: 'all' });
      expect(resAll).toHaveLength(2);
    });

    it('handles null, undefined, or empty logs input in filterLogs', () => {
      expect(filterLogs(null)).toEqual([]);
      expect(filterLogs(undefined)).toEqual([]);
      expect(filterLogs([])).toEqual([]);
    });

    it('filters correctly by level and case-insensitive search query', () => {
      const logs = [
        { id: '1', level: 'log', text: 'Server started on port 3000' },
        { id: '2', level: 'warn', text: 'PORT 3000 busy' },
        { id: '3', level: 'error', text: 'Failed to bind port 3000' },
      ];

      const res = filterLogs(logs, { filterLevel: 'error', searchQuery: 'PORT' });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('3');
    });
  });
});
