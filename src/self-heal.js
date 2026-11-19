import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CONFIG } from './config.js';

class SelfHealEngine {
  constructor() {
    this.telemetryFile = path.resolve(process.cwd(), '.hydrogen-telemetry.json');
  }

  runPreflightChecks() {
    if (CONFIG.DEBUG) {
      console.log('[Hydrogen Self-Heal] Running preflight system diagnostics...');
    }

    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('[Hydrogen Self-Heal] Missing dependencies detected. Auto-installing...');
      try {
        execSync('npm install', { stdio: 'inherit' });
      } catch (err) {
        console.error('[Hydrogen Self-Heal] Failed to auto-install dependencies:', err);
      }
    }

    const profileDir = path.resolve(process.cwd(), '.browser-profile');
    if (!fs.existsSync(profileDir)) {
      try {
        fs.mkdirSync(profileDir, { recursive: true });
      } catch (e) {}
    }

    this.reclaimPortIfNeeded(CONFIG.PORT);
    this.recordInvocation();
  }

  reclaimPortIfNeeded(port) {
    try {
      const output = execSync(`lsof -i :${port} -t`, { encoding: 'utf8' }).trim();
      if (output) {
        if (CONFIG.DEBUG) {
          console.log(`[Hydrogen Self-Heal] Port ${port} is currently bound. Operating in multi-instance cooperative mode.`);
        }
      }
    } catch (e) {
      if (CONFIG.DEBUG) {
        console.log(`[Hydrogen Self-Heal] Port ${port} check completed.`);
      }
    }
  }

  recordInvocation() {
    try {
      let telemetry = { invocations: 0, lastRun: null, errorCount: 0, selectorSuccessRate: {} };
      if (fs.existsSync(this.telemetryFile)) {
        try {
          telemetry = JSON.parse(fs.readFileSync(this.telemetryFile, 'utf8'));
        } catch (parseErr) {}
      }
      telemetry.invocations += 1;
      telemetry.lastRun = new Date().toISOString();
      fs.writeFileSync(this.telemetryFile, JSON.stringify(telemetry, null, 2));
    } catch (e) {
      // Non-blocking telemetry error
    }
  }

  reportError(errorType) {
    try {
      if (fs.existsSync(this.telemetryFile)) {
        const telemetry = JSON.parse(fs.readFileSync(this.telemetryFile, 'utf8'));
        telemetry.errorCount = (telemetry.errorCount || 0) + 1;
        telemetry.lastError = { type: errorType, time: new Date().toISOString() };
        fs.writeFileSync(this.telemetryFile, JSON.stringify(telemetry, null, 2));
      }
    } catch (e) {}
  }
}

export const selfHeal = new SelfHealEngine();
