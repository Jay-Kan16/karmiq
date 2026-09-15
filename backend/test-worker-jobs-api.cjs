const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: '6aa8c79222c1395fd2bd4bae', role: 'worker' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Garima Token:', token);

fetch('http://localhost:5000/api/worker/jobs', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('GET /api/worker/jobs response:', JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Fetch error:', err);
    process.exit(1);
  });

