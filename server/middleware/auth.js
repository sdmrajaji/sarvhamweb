const crypto = require('crypto');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const tokenParts = token.split('.');
    if (tokenParts.length !== 2) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const [base64Payload, signature] = tokenParts;
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);

    const secret = process.env.ADMIN_PASSWORD || 'sarvhamadmin';
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
    }

    if (payload.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }

    req.admin = payload.username;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
