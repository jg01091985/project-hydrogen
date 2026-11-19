import http from 'http';

function queryPort(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ port, status: res.statusCode, data }));
    });
    req.on('error', err => reject(err));
    req.setTimeout(800, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function scanAndTalk() {
  console.log('📡 [Master Orchestrator]: Scanning local machine ports (31337, 32091) to talk to the calculator instance...');
  const ports = [31337, 32091, 8080];

  for (const p of ports) {
    try {
      console.log(`🔍 Pinging http://127.0.0.1:${p} ...`);
      const res = await queryPort(p);
      console.log(`🎯 FOUND ACTIVE INSTANCE ON PORT ${p}! Response:`, res.data.substring(0, 300));
    } catch (err) {
      console.log(`ℹ️ Port ${p}: No active HTTP response (${err.message}).`);
    }
  }
}

scanAndTalk();
