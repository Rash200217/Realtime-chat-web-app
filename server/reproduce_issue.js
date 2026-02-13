const http = require('http');

function makeRequest(path, method, body) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('BODY:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  if (body) {
    req.write(JSON.stringify(body));
  }
  
  req.end();
}

console.log("Testing Health Check...");
makeRequest('/', 'GET');

setTimeout(() => {
  console.log("\nTesting Registration...");
  makeRequest('/api/auth/register', 'POST', {
    username: "testuser_" + Date.now(),
    email: "test_" + Date.now() + "@example.com",
    password: "password123"
  });
}, 1000);
