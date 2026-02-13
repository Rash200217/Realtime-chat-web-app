const http = require('http');

const request = (path, method, token, data) => {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(data || {});
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
    };
    
    if (data) options.headers['Content-Length'] = dataString.length;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body || '{}') });
      });
    });

    req.on('error', (e) => reject(e));
    if (data) req.write(dataString);
    req.end();
  });
};

const runTest = async () => {
  const adminUser = {
    username: "dashboard_tester",
    email: "admin_dashboard_test_" + Date.now() + "@test.com",
    password: "password123"
  };

  try {
    console.log("1. Creating Admin User...");
    await request('/auth/register', 'POST', null, adminUser);
    
    console.log("2. Logging in...");
    const loginRes = await request('/auth/login', 'POST', null, { email: adminUser.email, password: adminUser.password });
    const token = loginRes.body.token;
    
    if (!token) {
        console.error("Login failed, no token");
        return;
    }
    console.log("   Token received.");

    console.log("3. Testing /admin/stats...");
    const statsRes = await request('/admin/stats', 'GET', token);
    console.log("   Status:", statsRes.status, "Body:", statsRes.body);

    console.log("4. Testing /admin/users...");
    const usersRes = await request('/admin/users', 'GET', token);
    console.log("   Status:", usersRes.status, "Users Found:", usersRes.body.users?.length);

    console.log("5. Testing /admin/chats...");
    const chatsRes = await request('/admin/chats', 'GET', token);
    console.log("   Status:", chatsRes.status, "Chats Found:", chatsRes.body.length);

    if (statsRes.status === 200 && usersRes.status === 200 && chatsRes.status === 200) {
        console.log("\n✅ VERIFICATION SUCCESSFUL: Admin Dashboard API is working.");
    } else {
        console.log("\n❌ VERIFICATION FAILED: Some endpoints returned errors.");
    }

  } catch (err) {
    console.error("Test Failed:", err);
  }
};

runTest();
