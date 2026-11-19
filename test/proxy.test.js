import { createServer } from '../src/proxy.js';
import http from 'http';
import assert from 'assert';

export async function runProxyTests() {
  console.log('Running Proxy Tests...');

  const app = createServer();
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const port = server.address().port;

  const status = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });

  assert.strictEqual(status.status, 'ok');
  assert.strictEqual(status.service, 'hydrogen-enterprise-proxy');

  await new Promise((resolve) => server.close(resolve));
  console.log('✅ Proxy Tests Passed.');
}
