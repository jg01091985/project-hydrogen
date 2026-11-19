import fs from 'fs';
import path from 'path';

class WorkspaceIndexer {
  constructor(rootDir = process.cwd()) {
    this.rootDir = path.resolve(rootDir);
    this.symbolTable = new Map();
  }

  indexWorkspace() {
    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.history') {
          walk(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.matchAll(/(?:export\s+(?:class|function|const)\s+([a-zA-Z0-9_$]+))|(?:class\s+([a-zA-Z0-9_$]+))/g);
          const symbols = [];
          for (const m of matches) {
            symbols.push(m[1] || m[2]);
          }
          this.symbolTable.set(fullPath, { symbols, size: content.length });
        }
      }
    };

    walk(this.rootDir);
    return { indexedFiles: this.symbolTable.size };
  }

  findSymbol(symbolName) {
    const results = [];
    for (const [file, data] of this.symbolTable.entries()) {
      if (data.symbols.includes(symbolName)) {
        results.push({ file, symbols: data.symbols });
      }
    }
    return results;
  }
}

export const workspaceIndexer = new WorkspaceIndexer();
