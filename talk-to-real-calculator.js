import http from 'http';

function talkToCalculator() {
  console.log('📡 [Master Terminal]: Establishing secure IPC connection to the running "calculator" instance on port 32091...');

  const req = http.get('http://127.0.0.1:32091/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('🎯 SUCCESS! Connected to "calculator" instance on port 32091:');
      console.log(JSON.parse(data));

      console.log('🧮 Requesting task execution from "calculator" instance...');
      const payload = JSON.stringify({
        model: 'hydrogen',
        messages: [{ role: 'user', content: 'Calculate 153 * 42 and explain the math.' }]
      });

      const options = {
        hostname: '127.0.0.1',
        port: 32091,
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const calcReq = http.request(options, (calcRes) => {
        let calcData = '';
        calcRes.on('data', chunk => calcData += chunk);
        calcRes.on('end', () => {
          console.log('🎯 Response from "calculator" instance:');
          console.log(calcData);
          console.log('🎉 Multi-terminal cross-instance communication successfully completed!');
        });
      });

      calcReq.on('error', err => console.error('Calculation request failed:', err.message));
      calcReq.write(payload);
      calcReq.end();
    });
  });

  req.on('error', err => console.error('Connection to calculator failed:', err.message));
}

talkToCalculator();
