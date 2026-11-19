import { antiBot } from '../src/anti-bot.js';
import assert from 'assert';

export function runAntiBotTests() {
  console.log('Running Anti-Bot Tests...');

  const ua = antiBot.getRandomUserAgent();
  assert.ok(typeof ua === 'string' && ua.length > 10);

  const headers = antiBot.getFakeDnsHeaders('test-client');
  assert.ok(headers['User-Agent']);
  assert.ok(headers['X-Forwarded-For']);
  assert.strictEqual(headers['X-Hydrogen-Agent-ID'], 'test-client');

  const key = antiBot.getNextApiKey();
  assert.ok(typeof key === 'string');

  console.log('✅ Anti-Bot Tests Passed.');
}
