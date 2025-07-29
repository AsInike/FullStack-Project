import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const router = express.Router();

// Debug middleware for auth routes
router.use((req, res, next) => {
  console.log(`Auth Route: ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register endpoint hit with:', req.body);
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        received: { name: !!name, email: !!email, password: !!password }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password manually
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    
    console.log('User created successfully:', { id: user.id, name: user.name, email: user.email });
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Server error during registration',
      details: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login endpoint hit with:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user including password for comparison
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'role', 'points']
    });
    
    console.log('Found user from database:', {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      points: user?.points,
      hasPassword: !!user?.password
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );
    
    const responseUser = { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      points: user.points
    };
    
    console.log('Response user object:', responseUser);
    
    res.json({
      message: 'Login successful',
      token,
      user: responseUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login',
      details: error.message 
    });
  }
});

export default router;