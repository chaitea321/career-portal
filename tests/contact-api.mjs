import { describe, it } from 'node:test';
import assert from 'assert/strict';
import ContactAPI from '../js/contact-api.js';

describe('Contact API Module', () => {
  it('instantiates with default API URL', () => {
    const api = new ContactAPI();
    assert.strictEqual(api.apiUrl, '/api/contact');
  });

  it('instantiates with custom API URL', () => {
    const api = new ContactAPI('/custom/endpoint');
    assert.strictEqual(api.apiUrl, '/custom/endpoint');
  });

  it('submit returns error response when API returns non-200', async () => {
    // Mock fetch to return a 500 error
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    const api = new ContactAPI();
    const result = await api.submit({ name: 'Test', subject: 'Hi', message: 'Hello world!' });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Internal server error');

    global.fetch = originalFetch;
  });

  it('submit returns success when API returns 200', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully' })
    });

    const api = new ContactAPI();
    const result = await api.submit({ name: 'Jane', subject: 'Hello', message: 'This is a test message.' });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.message, 'Email sent successfully');

    global.fetch = originalFetch;
  });

  it('submit uses fallback when fetch throws (network error)', async () => {
    // Mock fetch to throw (simulating network failure)
    const originalFetch = global.fetch;
    global.fetch = async () => { throw new Error('Network unreachable'); };

    // Mock window.open to avoid ReferenceError in Node.js
    const originalWindow = global.window;
    global.window = { open: () => {} };

    const api = new ContactAPI();
    const result = await api.submit({ name: 'Test User', subject: 'Portfolio Inquiry', message: 'I love your work!' });

    assert.strictEqual(result.success, true);
    assert.ok(result.message.includes('backend unavailable'));
    assert.strictEqual(result.fallback, true);

    global.fetch = originalFetch;
    global.window = originalWindow;
  });

  it('submit returns generic server error when API response has no error field', async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: false,
      status: 429,
      json: async () => ({ detail: 'Too many requests' })
    });

    const api = new ContactAPI();
    const result = await api.submit({ name: 'Spam', subject: 'Buy', message: 'Click here' });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Server error');

    global.fetch = originalFetch;
  });

  it('fallback generates correct mailto URL structure', () => {
    const originalWindow = global.window;
    let openedUrl = null;
    global.window = { open: (url) => { openedUrl = url; } };

    const api = new ContactAPI();
    api._fallbackMailto('Alice', 'Collaboration', 'Let\'s build something cool.');

    assert.ok(openedUrl.startsWith('mailto:'));
    assert.ok(openedUrl.includes('subject='));
    assert.ok(openedUrl.includes('body='));
    assert.ok(openedUrl.includes('Collaboration'));
    assert.ok(openedUrl.includes('Alice'));

    global.window = originalWindow;
  });

  it('fallback handles special characters in mailto URL', () => {
    const originalWindow = global.window;
    let openedUrl = null;
    global.window = { open: (url) => { openedUrl = url; } };

    const api = new ContactAPI();
    api._fallbackMailto('O\'Brien', 'Test & More', 'Line1\nLine2');

    assert.ok(openedUrl);
    assert.ok(openedUrl.includes('O\'Brien')); // apostrophe stays literal (not URL-reserved)
    assert.ok(openedUrl.includes('%26')); // ampersand in subject is encoded
    assert.ok(openedUrl.includes('%0A')); // newlines in body are encoded

    global.window = originalWindow;
  });
});
