import fs from 'fs';
import path from 'path';
import { vault } from './vault.js';

class AutonomousCheckpointManager {
  constructor() {
    this.checkpointDir = path.resolve(process.cwd(), '.hydrogen-checkpoints');
    if (!fs.existsSync(this.checkpointDir)) {
      try {
        fs.mkdirSync(this.checkpointDir, { recursive: true });
      } catch (e) {}
    }
  }

  createCheckpoint(sessionState = {}) {
    const checkpointId = `chk_${Date.now()}`;
    const filePath = path.join(this.checkpointDir, `${checkpointId}.enc`);
    const payload = {
      timestamp: new Date().toISOString(),
      uptimeHours: process.uptime() / 3600,
      state: sessionState
    };
    const encrypted = vault.encrypt(JSON.stringify(payload));
    fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2));
    return { success: true, checkpointId, path: filePath };
  }

  listCheckpoints() {
    if (!fs.existsSync(this.checkpointDir)) return [];
    return fs.readdirSync(this.checkpointDir).filter(f => f.endsWith('.enc'));
  }
}

export const checkpointManager = new AutonomousCheckpointManager();
