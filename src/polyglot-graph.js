import fs from 'fs';
import path from 'path';

class PolyglotSymbolGraph {
  constructor(rootDir = process.cwd()) {
    this.rootDir = path.resolve(rootDir);
    this.polyglotSymbols = new Map();
  }

  indexPolyglotWorkspace() {
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !['node_modules', '.git', '.history', '.browser-profile', '.hydrogen-checkpoints'].includes(entry.name)) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.js', '.ts', '.py', '.go', '.rs'].includes(ext)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let matches = [];
            if (ext === '.py') {
              matches = [...content.matchAll(/def\s+([a-zA-Z0-9_$]+)|class\s+([a-zA-Z0-9_$]+)/g)].map(m => m[1] || m[2]);
            } else if (ext === '.go') {
              matches = [...content.matchAll(/func\s+([a-zA-Z0-9_$]+)|type\s+([a-zA-Z0-9_$]+)/g)].map(m => m[1] || m[2]);
            } else if (ext === '.rs') {
              matches = [...content.matchAll(/fn\s+([a-zA-Z0-9_$]+)|struct\s+([a-zA-Z0-9_$]+)|enum\s+([a-zA-Z0-9_$]+)/g)].map(m => m[1] || m[2] || m[3]);
            } else {
              matches = [...content.matchAll(/(?:export\s+(?:class|function|const)\s+([a-zA-Z0-9_$]+))|(?:class\s+([a-zA-Z0-9_$]+))/g)].map(m => m[1] || m[2]);
            }
            this.polyglotSymbols.set(fullPath, { ext, symbols: matches.filter(Boolean) });
          }
        }
      }
    };
    walk(this.rootDir);
    return { indexedFiles: this.polyglotSymbols.size };
  }
}

export const polyglotGraph = new PolyglotSymbolGraph();
