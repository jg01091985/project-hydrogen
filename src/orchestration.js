import { sdkBridge } from './sdk-bridge.js';
import { browserBridge } from './browser-bridge.js';
import { CONFIG } from './config.js';

class OrchestrationEngine {
  constructor() {
    this.activeWorkers = new Map();
    this.maxCachedWorkers = 100;
  }

  cleanupWorkers() {
    if (this.activeWorkers.size > this.maxCachedWorkers) {
      const entries = Array.from(this.activeWorkers.entries());
      // Keep most recent 50 entries
      const toDelete = entries.slice(0, entries.length - 50);
      for (const [id] of toDelete) {
        this.activeWorkers.delete(id);
      }
    }
  }

  async executeTaskParallel(tasks = [], workerType = 'sdk') {
    if (!tasks || tasks.length === 0) return [];

    this.cleanupWorkers();

    const promises = tasks.map(async (task, index) => {
      const workerId = `worker_${index}_${Math.random().toString(36).substring(2, 7)}`;
      this.activeWorkers.set(workerId, { status: 'running', task, timestamp: Date.now() });

      try {
        let result;
        if (workerType === 'sdk' || CONFIG.USE_SDK) {
          result = await sdkBridge.generateContent({
            model: CONFIG.GEMINI_MODEL,
            messages: [{ role: 'user', content: task }]
          }, CONFIG.GEMINI_MODEL);
        } else {
          result = await browserBridge.executePrompt(task);
        }

        this.activeWorkers.set(workerId, { status: 'completed', task, timestamp: Date.now() });
        return { workerId, success: true, result };
      } catch (err) {
        this.activeWorkers.set(workerId, { status: 'failed', error: err.message, timestamp: Date.now() });
        return { workerId, success: false, error: err.message };
      }
    });

    return Promise.all(promises);
  }

  getStatus() {
    const workers = Array.from(this.activeWorkers.entries()).map(([id, state]) => ({ id, ...state }));
    return {
      activeWorkersCount: this.activeWorkers.size,
      workers
    };
  }
}

export const orchestration = new OrchestrationEngine();
