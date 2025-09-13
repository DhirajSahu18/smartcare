import express from 'express';
import jwt from 'jsonwebtoken';
import { Patient, Hospital } from '../models/index.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (patient or hospital)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { role, name, email, phone, password, type, address, latitude, longitude, specialties, diseases } = req.body;

    // Validate role
    if (!['patient', 'hospital'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either patient or hospital.'
      });
    }

    // Check if user already exists
    const Model = role === 'patient' ? Patient : Hospital;
    const existingUser = await Model.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    let newUser;

    if (role === 'patient') {
      // Create patient
      newUser = new Patient({
        name,
        email,
        phone,
        password,
        role
      });
    } else {
      // Create hospital
      if (!type || !address) {
        return res.status(400).json({
          success: false,
          message: 'Hospital type and address are required.'
        });
      }

      newUser = new Hospital({
        name,
        email,
        phone,
        password,
        role,
        type,
        address,
        location: {
          type: 'Point',
          coordinates: [longitude || -73.9851, latitude || 40.7589] // [lng, lat]
        },
        specialties: specialties || [],
        diseases: diseases || [],
        rating: 4.0
      });
    }

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Get user from appropriate model
    const Model = role === 'patient' ? Patient : Hospital;
    const user = await Model.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const Model = decoded.role === 'patient' ? Patient : Hospital;
    const user = await Model.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;