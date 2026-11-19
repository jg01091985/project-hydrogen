import http from 'http';

const payload = JSON.stringify({
  model: 'hydrogen',
  messages: [{ role: 'user', content: 'hello' }]
});

const options = {
  hostname: '127.0.0.1',
  port: 8080,
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('📡 Sending prompt "hello" to live instance on port 8080...');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`🎯 Response status: ${res.statusCode}`);
    console.log('🎯 Live Response from Instance:', data);
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.write(payload);
req.end();
