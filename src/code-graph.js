import fs from 'fs';
import path from 'path';

class SemanticCodeGraph {
  constructor(srcDir = './src') {
    this.srcDir = path.resolve(process.cwd(), srcDir);
    this.nodes = new Map();
  }

  buildGraph() {
    if (!fs.existsSync(this.srcDir)) return { nodeCount: 0, graph: {} };
    const files = fs.readdirSync(this.srcDir);
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const filePath = path.join(this.srcDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const imports = [];
        const matches = content.matchAll(/import\s+.*?from\s+['"]\.\/(.*?)['"]/g);
        for (const match of matches) {
          imports.push(match[1]);
        }
        this.nodes.set(file, { path: filePath, imports, size: content.length });
      }
    }
    return { nodeCount: this.nodes.size, graph: Object.fromEntries(this.nodes) };
  }

  analyzeDeadCode() {
    const graphData = this.buildGraph();
    const referencedFiles = new Set(['test-stress.js']);
    for (const [file, data] of this.nodes.entries()) {
      for (const imp of data.imports) {
        const target = imp.endsWith('.js') ? imp : `${imp}.js`;
        referencedFiles.add(target);
      }
    }
    const unreferenced = [];
    for (const file of this.nodes.keys()) {
      if (!referencedFiles.has(file) && file !== 'index.js') {
        unreferenced.push(file);
      }
    }
    return { totalFiles: this.nodes.size, unreferenced, clean: unreferenced.length === 0 };
  }
}

export const codeGraph = new SemanticCodeGraph();
