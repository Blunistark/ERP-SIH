import jwt from 'jsonwebtoken';

// Use the same JWT_SECRET from .env
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Create a test token with a valid user ID
const payload = {
  id: 'cmf9hohgy000iph63vcnpmbsx', // Real admin user ID from database
  email: 'admin@school.edu',
  role: 'ADMIN'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

console.log('Generated JWT Token:');
console.log(token);

// Also test with PowerShell-compatible format
console.log('\nFor PowerShell usage:');
console.log(`"Bearer ${token}"`);
