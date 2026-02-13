const http = require('http');

function makeRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = token;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  try {
    // 1. Register Admin
    const email = `admin_${Date.now()}@example.com`;
    console.log(`Registering admin: ${email}`);
    let res = await makeRequest('/api/auth/register', 'POST', {
      username: `admin_${Date.now()}`,
      email: email,
      password: "password123"
    });
    console.log("Register Res:", res.statusCode, res.body);

    // 2. Login
    console.log("Logging in...");
    res = await makeRequest('/api/auth/login', 'POST', {
      email: email,
      password: "password123"
    });
    console.log("Login Res:", res.statusCode);
    
    const loginData = JSON.parse(res.body);
    const token = loginData.token;
    
    if (!token) {
      console.error("No token received!");
      return;
    }
    console.log("Token received.");

    // 3. Get Stats
    console.log("Fetching Stats...");
    res = await makeRequest('/api/admin/stats', 'GET', null, token);
    console.log("Stats Res:", res.statusCode, res.body);

  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
