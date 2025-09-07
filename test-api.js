#!/usr/bin/env node

const http = require('http');

// Test health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/health', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health check passed:', response);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test API endpoints
async function runTests() {
  try {
    console.log('🚀 Testing School ERP Backend...\n');
    
    // Test health endpoint
    console.log('Testing health endpoint...');
    await testHealthEndpoint();
    
    console.log('\n✅ All tests passed!');
    console.log('\n📚 Available endpoints:');
    console.log('- Health: http://localhost:3000/health');
    console.log('- API Docs: http://localhost:3000/api-docs');
    console.log('- Auth: http://localhost:3000/api/auth/login');
    console.log('- Users: http://localhost:3000/api/users');
    console.log('- Classes: http://localhost:3000/api/classes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
