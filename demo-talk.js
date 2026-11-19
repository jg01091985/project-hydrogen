import http from 'http';
import { CONFIG } from './src/config.js';
import { instanceBridge } from './src/instance-bridge.js';

async function runDemo() {
  console.log('🤖 [Hydrogen Master Swarm Demo]: Spawning local companion HTTP server to simulate calculator / sibling instance...');

  const demoPort = CONFIG.PORT + 1;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      instance: 'Calculator Sibling Instance',
      port: demoPort,
      status: 'active',
      calculation: '0.1 + 0.2 = 0.3'
    }));
  });

  server.listen(demoPort, async () => {
    console.log(`🚀 Sibling instance listening on http://127.0.0.1:${demoPort}`);
    console.log('📡 Master Orchestrator broadcasting discovery ping across local swarm...');

    try {
      const active = await instanceBridge.scanLocalSwarm(demoPort, 2);
      console.log('🎯 Discovery Result from Sibling Instance:', JSON.stringify(active, null, 2));
    } catch (e) {
      console.log('Error during scan:', e.message);
    } finally {
      server.close();
      console.log('🔒 Sibling instance shut down cleanly.');
    }
  });
}

runDemo();
