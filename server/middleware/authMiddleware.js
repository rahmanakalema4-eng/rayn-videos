const jwt = require('jsonwebtoken');
const db = require('../db');
const { getJwtSecret } = require('../utils/jwt');

async function verifyToken(req, res, next) {
  const authorization = req.get('authorization');
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (!payload || typeof payload !== 'object' || !payload.userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const result = await db.query(
      'SELECT id, name, email, is_vip, is_admin FROM users WHERE id = $1',
      [payload.userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return next(error);
  }
}

function verifyVip(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.is_vip !== true) {
    return res.status(403).json({ message: 'Upgrade to VIP to download movies' });
  }
  return next();
}

function verifyAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.is_admin !== true) {
    return res.status(403).json({ message: 'Administrator access required' });
  }
  return next();
}

module.exports = { verifyToken, verifyVip, verifyAdmin };
