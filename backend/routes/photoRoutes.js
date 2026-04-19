/**
 * Photo Routes
 * 
 * POST /api/users/photos — Upload photos (base64 array)
 * GET /api/users/:phoneNumber/photos — Get user photos
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

function getUserModel() {
  return mongoose.model('User');
}

// Upload photos
router.post('/users/photos', async (req, res) => {
  try {
    const { phoneNumber, photos } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one photo is required' });
    }

    if (photos.length > 6) {
      return res.status(400).json({ success: false, message: 'Maximum 6 photos allowed' });
    }

    const User = getUserModel();
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { photos, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: `${photos.length} photo(s) uploaded successfully`,
      photoCount: photos.length,
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload photos' });
  }
});

// Get user photos
router.get('/users/:phoneNumber/photos', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const User = getUserModel();

    const user = await User.findOne({ phoneNumber }).select('photos name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      photos: user.photos || [],
      count: (user.photos || []).length,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch photos' });
  }
});

module.exports = router;
