import express from 'express';
import { TokenVerificationSecret } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user (protected)
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
