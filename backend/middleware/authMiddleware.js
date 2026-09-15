const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'crop_recommend_secret';

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No authentication token provided.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token. Please log in again.'
      });
    }

    // Fetch user from DB
    const result = await db.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    req.user = result.rows[0];
    next();

  } catch (err) {
    console.error('[Auth Middleware Error]', err.message);
    return res.status(500).json({
      success: false,
      error: 'Authentication server error.'
    });
  }
};

module.exports = { protect };
