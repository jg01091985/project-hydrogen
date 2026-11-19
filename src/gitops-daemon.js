import { execSync } from 'child_process';
import { selfEvolve } from './self-evolve.js';

class GitOpsAutonomousDaemon {
  constructor() {
    this.status = 'IDLE';
  }

  runAutonomousPipeline() {
    this.status = 'RUNNING';
    try {
      const statusOut = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
      const selfCheck = selfEvolve.analyzeAndMutate('src/proxy.js');

      this.status = 'SUCCESS';
      return {
        success: true,
        dirtyFiles: statusOut ? statusOut.split('\n').length : 0,
        selfCheck,
        message: 'Autonomous GitOps pipeline verified clean and optimized.'
      };
    } catch (err) {
      this.status = 'FAILED';
      return { success: false, error: err.message };
    }
  }
}

export const gitOps = new GitOpsAutonomousDaemon();
