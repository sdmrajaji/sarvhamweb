const crypto = require('crypto');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Auth verification failed: No authorization header found');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error(`Auth verification failed: Invalid authorization header scheme: "${authHeader}"`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token scheme' });
    }

    const token = authHeader.substring(7).trim();
    const tokenParts = token.split('.');
    if (tokenParts.length !== 2) {
      console.error(`Auth verification failed: Token did not split into 2 parts: parts count = ${tokenParts.length}, token = "${token}"`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const [base64Payload, signature] = tokenParts;
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch (parseErr) {
      console.error(`Auth verification failed: Payload JSON parse error: ${parseErr.message}, payloadStr = "${payloadStr}"`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    const secret = (process.env.ADMIN_PASSWORD || 'sarvhamadmin').trim();
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    if (signature !== expectedSignature) {
      console.error(`Auth verification failed: Signature mismatch!
        Received signature: "${signature}"
        Expected signature: "${expectedSignature}"
        Payload string used: "${payloadStr}"
        Secret length: ${secret.length}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
    }

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      console.error(`Auth verification failed: Token expired!
        expiresAt: ${payload.expiresAt} (${new Date(payload.expiresAt).toISOString()})
        current: ${Date.now()} (${new Date().toISOString()})`);
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }

    req.admin = payload.username;
    next();
  } catch (err) {
    console.error('Auth middleware critical error:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

