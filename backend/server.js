const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'wingmann';

mongoose.connect(MONGO_URL, {
  dbName: DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// MongoDB Schema
const userSchema = new mongoose.Schema({
  id: { type: String, default: () => require('crypto').randomUUID() },
  phoneNumber: { type: String, required: true, unique: true },
  countryCode: { type: String, default: '+91' },
  otp: String,
  otpVerified: { type: Boolean, default: false },
  
  // Basic Info
  gender: String,
  name: String,
  birthday: String,
  height: Number,
  
  // Location
  location: String,
  nativeState: String,
  
  // Story & Personality
  story: String,
  nonNegotiables: [String],
  offerings: [String],
  
  // Work/Education
  timeUsage: String,
  workDetails: {
    company: String,
    position: String,
    jobTitle: String,
  },
  studyDetails: {
    school: String,
    course: String,
    degree: String,
  },
  education: String,
  
  // Beliefs & Lifestyle
  religionImportance: String,
  religionFollow: String,
  foodHabits: [String],
  interests: [String],
  lifestyle: {
    drink: String,
    smoke: String,
    exercise: String,
  },
  
  // System
  onboardingCompleted: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// ============= API ROUTES =============

// Health Check
app.get('/api', (req, res) => {
  res.json({ message: 'WingMann API v1.0 - Node.js', status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============= AUTH ENDPOINTS =============

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber, countryCode = '+91' } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    
    if (user) {
      // Update existing user
      user.otp = otp;
      user.otpVerified = false;
      user.updatedAt = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        phoneNumber,
        countryCode,
        otp,
        otpVerified: false,
      });
      await user.save();
    }
    
    console.log(`📱 OTP sent to ${countryCode}${phoneNumber}: ${otp}`);
    
    // In production, send SMS here
    // For development, return OTP in response (REMOVE IN PRODUCTION!)
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp, // ONLY FOR DEVELOPMENT
      expiresIn: 600,
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, countryCode = '+91', otp } = req.body;
    
    const user = await User.findOne({ phoneNumber, countryCode });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // For development: accept any 6-digit OTP
    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    // Verify OTP (simplified for now)
    if (user.otp === otp || otp === '123456') {
      user.otpVerified = true;
      user.otp = null; // Clear OTP after verification
      user.updatedAt = new Date();
      await user.save();
      
      res.json({
        success: true,
        message: 'OTP verified successfully',
        userId: user.id,
        isNewUser: !user.onboardingCompleted,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
});

// ============= USER PROFILE ENDPOINTS =============

// Get User Profile
app.get('/api/users/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const user = await User.findOne({ phoneNumber }).select('-otp');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
});

// Update User Profile
app.patch('/api/users/profile', async (req, res) => {
  try {
    const { phoneNumber, data } = req.body;
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user data
    Object.assign(user, data);
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// Complete Onboarding
app.post('/api/users/complete-onboarding', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.onboardingCompleted = true;
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ success: false, message: 'Failed to complete onboarding', error: error.message });
  }
});

// ============= UTILITY ENDPOINTS =============

// Get All Users (Admin/Testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-otp').limit(1000);
    
    res.json({
      success: true,
      count: users.length,
      users: users,
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WingMann Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${DB_NAME}`);
});
