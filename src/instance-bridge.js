import http from 'http';

class InterInstanceSwarmBridge {
  constructor() {
    this.discoveredInstances = new Map();
  }

  async scanLocalSwarm(basePort = 31337, range = 50) {
    const activeInstances = [];
    for (let offset = 0; offset < range; offset++) {
      const targetPort = basePort + offset;
      try {
        const status = await this.pingInstance(targetPort);
        if (status) {
          activeInstances.push({ port: targetPort, status });
          this.discoveredInstances.set(targetPort, status);
        }
      } catch (e) {}
    }
    return activeInstances;
  }

  pingInstance(port) {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ port, alive: true });
          }
        });
      });
      req.on('error', err => reject(err));
      req.setTimeout(300, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }
}

export const instanceBridge = new InterInstanceSwarmBridge();
