const http = require('http');

const postRequest = (path, data) => {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body || '{}') });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(dataString);
    req.end();
  });
};

const runTest = async () => {
  const testUser = {
    username: "debug_user_" + Date.now(),
    email: "debug_" + Date.now() + "@test.com",
    password: "password123"
  };

  console.log("0. Testing Health Check");
  try {
     const health = await new Promise((resolve, reject) => {
        const req = http.request({ hostname: 'localhost', port: 5000, path: '/', method: 'GET' }, res => {
           let body = '';
           res.on('data', c => body += c);
           res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.end();
     });
     console.log("Health Check:", health);
  } catch (err) {
     console.error("Health Check Failed:", err.message);
  }

  console.log("1. Testing Register with:", testUser);
  try {
    const regRes = await postRequest('/register', testUser);
    console.log("Register Response:", regRes);

    if (regRes.status !== 201) return;

    console.log("2. Testing Login");
    const loginRes = await postRequest('/login', { email: testUser.email, password: testUser.password });
    console.log("Login Response:", loginRes);
  } catch (err) {
    console.error("Test Failed (Network/Server Error):", err);
  }
};

runTest();
