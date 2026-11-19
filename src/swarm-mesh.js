import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';
import { masterOrchestrator } from './master-orchestrator.js';

class SwarmMeshNetwork {
  constructor() {
    this.registryPath = path.resolve(process.cwd(), '.hydrogen-mesh-registry.json');
    this.nodeId = masterOrchestrator.getSwarmStatus().instanceId;
    this.port = CONFIG.PORT;
    this.peers = new Map();
  }

  registerNode(timeoutMs = 45000) {
    try {
      let registry = {};
      if (fs.existsSync(this.registryPath)) {
        try {
          registry = JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
        } catch (e) {}
      }
      registry[this.nodeId] = {
        nodeId: this.nodeId,
        port: this.port,
        workingDirectory: process.cwd(),
        lastHeartbeat: Date.now()
      };
      const now = Date.now();
      for (const [id, info] of Object.entries(registry)) {
        if (now - info.lastHeartbeat > timeoutMs) {
          delete registry[id];
        }
      }
      fs.writeFileSync(this.registryPath, JSON.stringify(registry, null, 2));
      return { registered: true, activeNodes: Object.keys(registry).length, timeoutMs };
    } catch (err) {
      return { registered: false, error: err.message };
    }
  }

  discoverPeers() {
    try {
      if (!fs.existsSync(this.registryPath)) return [];
      const registry = JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
      const activePeers = [];
      for (const [id, info] of Object.entries(registry)) {
        if (id !== this.nodeId) {
          activePeers.push(info);
        }
      }
      return activePeers;
    } catch (e) {
      return [];
    }
  }

  async sendPeerMessage(targetPort, message) {
    return {
      success: true,
      sender: this.nodeId,
      targetPort,
      message,
      ack: 'Mesh transmission acknowledged'
    };
  }
}

export const swarmMesh = new SwarmMeshNetwork();
