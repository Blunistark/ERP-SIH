#!/usr/bin/env node

const http = require('http');

// Create a request function
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Testing School ERP API...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const healthResponse = await makeRequest(healthOptions);
    console.log(`✅ Health Check: ${healthResponse.statusCode}`);
    console.log(JSON.stringify(healthResponse.body, null, 2));
  } catch (error) {
    console.log(`❌ Health Check failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Login
  console.log('2. Testing Login...');
  try {
    const loginData = {
      email: 'admin@school.edu',
      password: 'password123'
    };

    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
      }
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`✅ Login: ${loginResponse.statusCode}`);
    
    if (loginResponse.body && loginResponse.body.data && loginResponse.body.data.token) {
      const token = loginResponse.body.data.token;
      console.log('🔑 JWT Token received');
      console.log(`👤 User: ${loginResponse.body.data.user.email} (${loginResponse.body.data.user.role})`);
      
      console.log('\n' + '='.repeat(50) + '\n');

      // Test 3: Get Profile with Token
      console.log('3. Testing Get Profile with Authentication...');
      const profileOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/profile',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const profileResponse = await makeRequest(profileOptions);
      console.log(`✅ Get Profile: ${profileResponse.statusCode}`);
      if (profileResponse.body && profileResponse.body.data && profileResponse.body.data.profile) {
        console.log(`📋 Profile Name: ${profileResponse.body.data.profile.firstName} ${profileResponse.body.data.profile.lastName}`);
      }

      console.log('\n' + '='.repeat(50) + '\n');

      // Test 4: Get Classes
      console.log('4. Testing Get Classes...');
      const classesOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/classes',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const classesResponse = await makeRequest(classesOptions);
      console.log(`✅ Get Classes: ${classesResponse.statusCode}`);
      if (classesResponse.body && classesResponse.body.data && classesResponse.body.data.classes) {
        console.log(`📚 Found ${classesResponse.body.data.classes.length} classes`);
        classesResponse.body.data.classes.forEach((cls, index) => {
          console.log(`   ${index + 1}. ${cls.name} Section ${cls.section} (${cls._count.students} students)`);
        });
      }

    } else {
      console.log('❌ Login failed - no token received');
      console.log(JSON.stringify(loginResponse.body, null, 2));
    }

  } catch (error) {
    console.log(`❌ Login failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 API Test Complete!');
}

// Start the test
testAPI().catch(console.error);
