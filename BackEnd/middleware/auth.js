/**
 * JWT authentication middleware.
 * Validates Bearer tokens and attaches user payload to req.user.
 * @middleware
 * @function TokenVerificationSecret
 * @param {Object} req Express Request object
 * @param {Object} res Express Response object
 * @param {Function} next Express middleware next function
 * @returns {void}
 */
import jwt from 'jsonwebtoken';

export const TokenVerificationSecret = (req, res, next) => {
  const raw = req.headers['authorization'] || '';
  const token = raw.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(
      token,
      globalThis.process.env.JWT_SECRET || 'dev_secret'
    )

    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      raw: decoded
    }

    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    next();
  } catch (err) {
    console.error('JWT verification failed:', err)
    return res.status(401).send({ message: 'Invalid Token' });
  }
};

export default TokenVerificationSecret;
