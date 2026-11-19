import fs from 'fs';
import path from 'path';

class AtomicTransactionManager {
  constructor() {
    this.backups = new Map();
  }

  beginTransaction(filePaths = []) {
    this.backups.clear();
    for (const fp of filePaths) {
      const fullPath = path.resolve(process.cwd(), fp);
      if (fs.existsSync(fullPath)) {
        this.backups.set(fullPath, fs.readFileSync(fullPath, 'utf8'));
      }
    }
    return { success: true, filesBackedUp: this.backups.size };
  }

  rollback() {
    for (const [fullPath, originalContent] of this.backups.entries()) {
      fs.writeFileSync(fullPath, originalContent, 'utf8');
    }
    return { success: true, rolledBackFiles: this.backups.size };
  }
}

export const atomicTx = new AtomicTransactionManager();
