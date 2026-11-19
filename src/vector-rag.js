import fs from 'fs';
import path from 'path';

class LocalVectorRAGEngine {
  constructor(srcDir = './src') {
    this.srcDir = path.resolve(process.cwd(), srcDir);
    this.embeddingsIndex = new Map();
  }

  tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  }

  indexCodebase() {
    if (!fs.existsSync(this.srcDir)) return;
    const files = fs.readdirSync(this.srcDir);
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const filePath = path.join(this.srcDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const tokens = this.tokenize(content);
        const freq = {};
        for (const t of tokens) {
          freq[t] = (freq[t] || 0) + 1;
        }
        this.embeddingsIndex.set(file, { path: filePath, vector: freq });
      }
    }
    return { indexedFiles: this.embeddingsIndex.size };
  }

  semanticSearch(query) {
    const queryTokens = this.tokenize(query);
    let bestMatch = null;
    let highestScore = -1;

    for (const [file, data] of this.embeddingsIndex.entries()) {
      let score = 0;
      for (const qt of queryTokens) {
        if (data.vector[qt]) {
          score += data.vector[qt];
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = file;
      }
    }
    return { query, bestMatch, score: highestScore };
  }
}

export const vectorRag = new LocalVectorRAGEngine();
