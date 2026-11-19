import { CONFIG } from '../src/config.js';
import assert from 'assert';

export function runConfigTests() {
  console.log('Running Config Tests...');

  assert.ok(typeof CONFIG.PORT === 'number');
  assert.ok(typeof CONFIG.GEMINI_MODEL === 'string');
  assert.ok(typeof CONFIG.HEADLESS === 'boolean');
  assert.ok(typeof CONFIG.USE_SDK === 'boolean');
  assert.ok(Array.isArray(CONFIG.PROXY_LIST));
  assert.ok(Array.isArray(CONFIG.GEMINI_API_KEYS));

  console.log('✅ Config Tests Passed.');
}
