import fs from 'fs';
import path from 'path';
import { vault } from './vault.js';
import { vectorRag } from './vector-rag.js';

class ZeroAmnesiaMemoryLedger {
  constructor() {
    this.ledgerPath = path.resolve(process.cwd(), '.hydrogen-episodic-memory.enc');
    this.episodes = [];
  }

  recordEpisode(prompt, response, metadata = {}) {
    const episode = {
      id: `ep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      prompt,
      response,
      metadata
    };
    this.episodes.push(episode);
    this.persist();
    return episode;
  }

  persist() {
    try {
      const dataStr = JSON.stringify(this.episodes);
      const encrypted = vault.encrypt(dataStr);
      fs.writeFileSync(this.ledgerPath, JSON.stringify(encrypted, null, 2));
    } catch (e) {}
  }

  retrieveRelevantContext(query) {
    const matches = this.episodes.filter(ep => ep.prompt.toLowerCase().includes(query.toLowerCase()) || ep.response.toLowerCase().includes(query.toLowerCase()));
    const ragResult = vectorRag.semanticSearch(query);
    return {
      recentEpisodes: matches.slice(-3),
      semanticMatch: ragResult
    };
  }
}

export const memoryLedger = new ZeroAmnesiaMemoryLedger();
