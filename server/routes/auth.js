const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'sarvhamadmin';

    if (username === adminUser && password === adminPass) {
      const secret = adminPass;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      const payload = JSON.stringify({ username, expiresAt });
      const base64Payload = Buffer.from(payload).toString('base64');
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const token = `${base64Payload}.${signature}`;

      return res.json({ token, message: 'Login successful' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
});

module.exports = router;
