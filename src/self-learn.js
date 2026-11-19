import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';

class SelfLearningEngine {
  constructor() {
    this.memoryFile = path.resolve(process.cwd(), '.hydrogen-learning.json');
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        return JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
      }
    } catch (e) {}
    return {
      version: '1.1.0',
      generationCount: 0,
      optimizedJitterMin: CONFIG.JITTER_MIN_MS,
      optimizedJitterMax: CONFIG.JITTER_MAX_MS,
      successRate: 1.0,
      adaptiveWeights: {
        sdkPriority: 1.0,
        browserStealthLevel: 2.0
      },
      historicalPerformance: [],
      lessons: []
    };
  }

  async persistStateAsync() {
    try {
      await fs.promises.writeFile(this.memoryFile, JSON.stringify(this.state, null, 2));
    } catch (e) {}
  }

  recordLesson(problem, predictedEffect, observedEffect, modelAndEffort, success = true) {
    this.state.lessons = this.state.lessons || [];
    this.state.lessons.push({
      timestamp: new Date().toISOString(),
      problem,
      predictedEffect,
      observedEffect,
      modelAndEffort,
      success
    });
    this.persistStateAsync();
  }

  recordRun(success = true, latencyMs = 0) {
    this.state.generationCount += 1;
    this.state.historicalPerformance.push({
      timestamp: new Date().toISOString(),
      success,
      latencyMs
    });
    if (this.state.historicalPerformance.length > 100) {
      this.state.historicalPerformance.shift();
    }

    const successes = this.state.historicalPerformance.filter(p => p.success).length;
    this.state.successRate = successes / this.state.historicalPerformance.length;

    if (!success) {
      this.state.optimizedJitterMin = Math.min(500, this.state.optimizedJitterMin + 25);
      this.state.optimizedJitterMax = Math.min(1000, this.state.optimizedJitterMax + 50);
    } else {
      this.state.optimizedJitterMin = Math.max(20, this.state.optimizedJitterMin - 5);
      this.state.optimizedJitterMax = Math.max(100, this.state.optimizedJitterMax - 10);
    }

    this.persistStateAsync();
  }

  getMetricsSummary() {
    return {
      generationCount: this.state.generationCount,
      successRate: (this.state.successRate * 100).toFixed(1) + '%',
      jitterRange: `${this.state.optimizedJitterMin}ms - ${this.state.optimizedJitterMax}ms`
    };
  }
}

export const selfLearn = new SelfLearningEngine();
