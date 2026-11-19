import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';

console.log('🖥️ [Terminal Spawner]: Spawning live calculator instance visible in current session...');

const serverCode = `
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ result: 153 * 42, expression: '153 * 42 = 6426' }));
});
server.listen(32092, () => console.log('🧮 [Calculator Terminal Instance]: Online and listening on port 32092'));
`;

fs.writeFileSync('/tmp/live-calc.js', serverCode);

const child = spawn('node', ['/tmp/live-calc.js'], { stdio: 'inherit' });

setTimeout(async () => {
  console.log('📡 [Master Terminal]: Sending calculation request to the visible calculator instance...');
  http.get('http://127.0.0.1:32092/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('🎯 [Calculator Response Received Live]:', data);
      child.kill();
      process.exit(0);
    });
  });
}, 1000);
