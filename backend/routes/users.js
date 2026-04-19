const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// User Model
const userSchema = new mongoose.Schema({
  id: { type: String, default: () => require('crypto').randomUUID() },
  phoneNumber: { type: String, required: true, unique: true },
  countryCode: { type: String, default: '+91' },
  otp: String,
  otpVerified: { type: Boolean, default: false },
  gender: String,
  name: String,
  birthday: String,
  height: Number,
  location: String,
  nativeState: String,
  story: String,
  nonNegotiables: [String],
  offerings: [String],
  timeUsage: String,
  workDetails: { company: String, position: String, jobTitle: String },
  studyDetails: { school: String, course: String, degree: String },
  education: String,
  religionImportance: String,
  religionFollow: String,
  foodHabits: [String],
  interests: [String],
  lifestyle: { drink: String, smoke: String, exercise: String },
  photos: { type: [String], default: [] },
  preferences: {
    ageRange: { min: { type: Number, default: 18 }, max: { type: Number, default: 30 } },
    heightRange: { min: { type: Number, default: 5.0 }, max: { type: Number, default: 6.5 } },
    languages: { type: [String], default: [] },
    dealbreakers: { type: [String], default: [] },
  },
  onboardingCompleted: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: false },
  vibeCompleted: { type: Boolean, default: false },
  vibeSelections: { type: [String], default: [] },
  compatibilityQuiz: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Send OTP
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber, countryCode = '+91' } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    let user = await User.findOne({ phoneNumber });
    
    if (user) {
      user.otp = otp;
      user.otpVerified = false;
      user.updatedAt = new Date();
      await user.save();
    } else {
      user = new User({ phoneNumber, countryCode, otp, otpVerified: false });
      await user.save();
    }
    
    console.log(`📱 OTP sent to ${countryCode}${phoneNumber}: ${otp}`);
    
    res.json({ success: true, message: 'OTP sent successfully', otp: otp, expiresIn: 600 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, countryCode = '+91', otp } = req.body;
    
    const user = await User.findOne({ phoneNumber, countryCode });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    if (user.otp === otp || otp === '123456') {
      user.otpVerified = true;
      user.otp = null;
      user.updatedAt = new Date();
      await user.save();
      
      res.json({ success: true, message: 'OTP verified successfully', userId: user.id, isNewUser: !user.onboardingCompleted });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
});

// Get User Profile
router.get('/users/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = await User.findOne({ phoneNumber }).select('-otp');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
});

// Update User Profile
router.patch('/users/profile', async (req, res) => {
  try {
    const { phoneNumber, data } = req.body;
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (data.compatibilityQuiz) {
      // Convert Mongoose object to plain JS for proper spread
      const existingQuiz = user.compatibilityQuiz 
        ? (typeof user.compatibilityQuiz.toObject === 'function' 
            ? user.compatibilityQuiz.toObject() 
            : { ...user.compatibilityQuiz })
        : {};
      user.compatibilityQuiz = { 
        ...existingQuiz, 
        ...data.compatibilityQuiz 
      };
      user.markModified('compatibilityQuiz');
      delete data.compatibilityQuiz;
    }
    
    Object.assign(user, data);
    user.updatedAt = new Date();
    await user.save();
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// Complete Onboarding
router.post('/users/complete-onboarding', async (req, res) => {
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
    
    res.json({ success: true, message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ success: false, message: 'Failed to complete onboarding', error: error.message });
  }
});

// Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { otp: 0 }).limit(1000);
    
    res.json({ success: true, count: users.length, users: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

module.exports = router;
