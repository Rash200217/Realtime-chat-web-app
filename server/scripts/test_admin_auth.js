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
  const adminUser = {
    username: "admin_test_" + Date.now(),
    email: "super_admin_" + Date.now() + "@test.com", // Contains 'admin'
    password: "password123"
  };

  console.log("1. Registering Admin User:", adminUser.email);
  try {
    const regRes = await postRequest('/register', adminUser);
    
    if (regRes.status !== 201) {
       console.error("Register Failed:", regRes);
       return;
    }

    console.log("2. Logging in as Admin");
    const loginRes = await postRequest('/login', { email: adminUser.email, password: adminUser.password });
    
    if (loginRes.body.user && loginRes.body.user.role === 'admin') {
       console.log("SUCCESS: User has role 'admin'");
    } else {
       console.error("FAILURE: User role is", loginRes.body.user?.role);
    }

  } catch (err) {
    console.error("Test Failed:", err);
  }
};

runTest();
