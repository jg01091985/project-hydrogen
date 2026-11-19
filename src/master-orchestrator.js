import { orchestration } from './orchestration.js';
import { codeGraph } from './code-graph.js';
import { CONFIG } from './config.js';

class MasterSwarmOrchestrator {
  constructor() {
    this.instanceId = `master_orch_${Math.random().toString(36).substring(2, 9)}`;
    this.workingDirectory = process.cwd();
    this.port = CONFIG.PORT;
    this.team = [
      { role: 'Architect', status: 'idle' },
      { role: 'Coder', status: 'idle' },
      { role: 'Reviewer', status: 'idle' },
      { role: 'TestRunner', status: 'idle' }
    ];
  }

  getSwarmStatus() {
    return {
      instanceId: this.instanceId,
      workingDirectory: this.workingDirectory,
      port: this.port,
      teamSize: this.team.length,
      team: this.team,
      codeGraphNodes: codeGraph.buildGraph()?.nodeCount || 0
    };
  }

  async dispatchSwarmTask(taskDescription) {
    const subTasks = [
      `[Architect Lens]: Design implementation plan for: ${taskDescription}`,
      `[Coder Lens]: Write implementation code for: ${taskDescription}`,
      `[Reviewer Lens]: Audit and security check for: ${taskDescription}`
    ];

    const results = await orchestration.executeTaskParallel(subTasks, 'sdk');
    return {
      success: true,
      instanceId: this.instanceId,
      task: taskDescription,
      results
    };
  }
}

export const masterOrchestrator = new MasterSwarmOrchestrator();
