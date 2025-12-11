/**
 * JWT authentication middleware.
 * Validates Bearer tokens and attaches user payload to req.user.
 * @middleware
 * @function TokenVerificationSecret
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {Function} next 
 * @returns {void}
 */
import jwt from 'jsonwebtoken';

export const TokenVerificationSecret = (req, res, next) => {
  const raw = req.headers['authorization'] || '';
  const token = raw.replace(/^Bearer\s+/i, '') || null;
  if (!token) return res.status(401).send({ message: 'Access Denied. No token provided.' });
  try {
    req.user = jwt.verify(token, globalThis.process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch (err) {
    console.error(`An error occured: ${err}`)
    return res.status(401).send({ message: 'Invalid Token' });
  }
};

export default TokenVerificationSecret;
