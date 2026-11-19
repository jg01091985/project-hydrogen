import { createServer } from './src/proxy.js';
import { CONFIG } from './src/config.js';
import { instanceBridge } from './src/instance-bridge.js';
import http from 'http';

async function liveDemo() {
  console.log('🚀 [Live Master Orchestrator]: Spawning actual Project Hydrogen instance on local port...');
  const app = createServer();
  const testPort = CONFIG.PORT + 5;

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', instance: 'Project Hydrogen Master', port: testPort, timestamp: Date.now() });
  });

  const server = http.createServer(app);
  server.listen(testPort, async () => {
    console.log(`🟢 Real Hydrogen instance listening on http://127.0.0.1:${testPort}`);
    console.log('📡 Master Orchestrator communicating with the live instance via HTTP request...');

    try {
      const response = await instanceBridge.pingInstance(testPort);
      console.log('🎯 SUCCESS! Live response received from Hydrogen instance:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.error('❌ Communication failed:', err.message);
    } finally {
      server.close();
      console.log('🔒 Live Hydrogen instance shut down cleanly.');
    }
  });
}

liveDemo();
