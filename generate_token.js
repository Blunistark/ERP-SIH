const jwt = require('jsonwebtoken');

// Use the same JWT_SECRET from .env
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Create a test token with a valid user ID (assuming we have a user with ID 1)
const payload = {
  id: 1,
  email: 'admin@school.com',
  role: 'ADMIN'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

console.log('Generated JWT Token:');
console.log(token);
