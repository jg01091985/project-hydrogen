import fs from 'fs';
import path from 'path';

class SemanticCodeGraph {
  constructor(srcDir = './src') {
    this.srcDir = path.resolve(process.cwd(), srcDir);
    this.nodes = new Map();
  }

  buildGraph() {
    if (!fs.existsSync(this.srcDir)) return;
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
}

export const codeGraph = new SemanticCodeGraph();
