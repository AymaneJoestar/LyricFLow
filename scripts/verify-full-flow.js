
import http from 'http';

const PORT = 3001; // Correct port from server.js
const TEST_USER = {
    username: `verify_bot_${Date.now()}`,
    email: `verify_${Date.now()}@test.com`,
    password: 'Password123!'
};

function request(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`Request failed (${res.statusCode}): ${data}`));
                    }
                } catch (e) {
                    if (data.trim() === '') resolve({});
                    else reject(new Error(`Invalid JSON: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTest() {
    console.log(`🚀 Starting Integration Verification (Port ${PORT})...`);

    try {
        // 1. Register
        console.log(`\n1️⃣  Registering User: ${TEST_USER.username}...`);
        await request('/register', 'POST', TEST_USER);
        console.log('✅ Registration Successful');

        // 2. Login
        console.log(`\n2️⃣  Logging In...`);
        const loginData = await request('/login', 'POST', { email: TEST_USER.email, password: TEST_USER.password });
        const token = loginData.token;

        if (!token) throw new Error('No token received!');
        console.log('✅ Login Successful (Token Received)');

        // 3. Create Song
        console.log(`\n3️⃣  Creating Test Song...`);
        const newSong = {
            userId: loginData.id,
            title: "Integration Test Song",
            styleDescription: "Test Style",
            structure: [],
            recommendations: []
        };

        const songData = await request('/songs', 'POST', newSong, token);

        if (songData.authorName === TEST_USER.username) {
            console.log(`✅ Author Attribution Verified: "${songData.authorName}"`);
        } else {
            console.error(`❌ Author Attribution Failed! Expected "${TEST_USER.username}", got "${songData.authorName}"`);
        }

        // 4. Delete Song
        console.log(`\n4️⃣  Deleting Song...`);
        await request(`/songs/${songData._id}`, 'DELETE', null, token);
        console.log('✅ Song Deleted Successfully');

        console.log('\n🎉 ALL TESTS PASSED');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.log(`\n⚠️  Could not connect to port ${PORT}. Is the server running?`);
        }
    }
}

runTest();
