import http from 'http';

const payload = JSON.stringify({
  model: 'hydrogen',
  stream: true,
  messages: [{ role: 'user', content: 'Write a haiku about code execution.' }]
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

console.log('📡 [Live Streaming Client]: Connecting to gateway on port 8080 with stream=true...');

const req = http.request(options, (res) => {
  console.log(`🎯 Connected! Status: ${res.statusCode}`);
  console.log('📝 Streaming output:\n----------------------------------------');

  res.on('data', (chunk) => {
    const raw = chunk.toString();
    const lines = raw.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.substring(6));
          if (json.delta && json.delta.text) {
            process.stdout.write(json.delta.text);
          }
        } catch (e) {}
      }
    }
  });

  res.on('end', () => {
    console.log('\n----------------------------------------\n✅ Stream completed successfully.');
  });
});

req.on('error', (err) => {
  console.error('❌ Stream failed:', err.message);
});

req.write(payload);
req.end();
