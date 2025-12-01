import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) return res.status(400).send({ message: 'Please enter all fields to continue' });
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(409).send({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ email, passwordHash, firstName, lastName });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).send({ message: 'Error registering user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send({ message: 'Email and password required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send({ message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).send({ message: 'Invalid email or password' });
    const token = jwt.sign({ _id: user._id, email: user.email }, globalThis.process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '1h',
    });
    res.send({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: "Error logging in" });
  }
});

export default router;
