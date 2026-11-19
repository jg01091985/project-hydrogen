import crypto from 'crypto';
import { vault } from './vault.js';

class TokenCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 500;
  }

  hashPrompt(prompt) {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  get(prompt) {
    const key = this.hashPrompt(prompt);
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      return { hit: true, response: vault.decrypt(entry.encryptedResponse) };
    }
    return { hit: false, response: null };
  }

  set(prompt, responseText) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    const key = this.hashPrompt(prompt);
    const encryptedResponse = vault.encrypt(responseText);
    this.cache.set(key, { timestamp: Date.now(), encryptedResponse });
  }
}

export const tokenCache = new TokenCacheManager();
