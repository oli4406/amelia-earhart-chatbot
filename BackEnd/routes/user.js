/**
 * User route controller.
 * Provides protected endpoints for retrieving user data.
 * @module routes/user
 */
import express from 'express';
import { TokenVerificationSecret } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * GET /api/user
 * Returns authenticated user's profile (excluding password hash).
 * @middleware TokenVerificationSecret
 */
router.get('/', TokenVerificationSecret, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).send({ message: 'Error fetching user data' });
  }
});

export default router;
