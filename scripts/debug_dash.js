const axios = require('axios');

async function testDashboard() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:3000/api/login', {
            username: 'admin',
            password: 'password' // Assuming default or known creds, if fails I'll ask user or check db seed
        });

        const cookie = loginRes.headers['set-cookie'];

        // 2. Fetch Dashboard
        const res = await axios.get('http://localhost:3000/api/reports/advanced?period=daily', {
            headers: { Cookie: cookie }
        });

        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

testDashboard();
