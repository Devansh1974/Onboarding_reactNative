const express = require('express');
const router = express.Router();
const { Admin, Session, Interviewer, User } = require('../models');

// ============= ADMIN AUTHENTICATION =============

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin
    let admin = await Admin.findOne({ email });
    
    // Create default admin if doesn't exist
    if (!admin && email === 'admin@wingmann.com' && password === 'admin123') {
      admin = new Admin({
        email: 'admin@wingmann.com',
        password: 'admin123', // In production, hash this!
        name: 'WingMann Admin',
      });
      await admin.save();
    }
    
    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
    
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ============= ADMIN DASHBOARD =============

// Get all sessions/bookings
router.get('/admin/sessions', async (req, res) => {
  try {
    const { status, reviewStatus } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (reviewStatus) query.reviewStatus = reviewStatus;
    
    const sessions = await Session.find(query)
      .populate('interviewer')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
    
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

// Get dashboard stats
router.get('/admin/stats', async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const scheduled = await Session.countDocuments({ status: 'scheduled' });
    const completed = await Session.countDocuments({ status: 'completed' });
    const underReview = await Session.countDocuments({ reviewStatus: 'under_review' });
    const approved = await Session.countDocuments({ reviewStatus: 'approved' });
    const rejected = await Session.countDocuments({ reviewStatus: 'rejected' });
    
    const totalInterviewers = await Interviewer.countDocuments({ active: true });
    
    res.json({
      success: true,
      stats: {
        totalSessions,
        scheduled,
        completed,
        underReview,
        approved,
        rejected,
        totalInterviewers,
      },
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Assign interviewer to session
router.post('/admin/sessions/:sessionId/assign', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { interviewerId, interviewerName } = req.body;
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.interviewer = interviewerId;
    session.interviewerName = interviewerName;
    session.updatedAt = new Date();
    
    await session.save();
    
    // Update interviewer's assigned sessions
    await Interviewer.findByIdAndUpdate(interviewerId, {
      $push: { assignedSessions: sessionId },
    });
    
    res.json({
      success: true,
      message: 'Interviewer assigned successfully',
      session,
    });
    
  } catch (error) {
    console.error('Error assigning interviewer:', error);
    res.status(500).json({ success: false, message: 'Failed to assign interviewer' });
  }
});

// Add Google Meet link to session
router.post('/admin/sessions/:sessionId/meeting-link', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { meetingLink } = req.body;
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.meetingLink = meetingLink;
    session.updatedAt = new Date();
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Meeting link added successfully',
      session,
    });
    
  } catch (error) {
    console.error('Error adding meeting link:', error);
    res.status(500).json({ success: false, message: 'Failed to add meeting link' });
  }
});

// Review and approve/reject profile
router.post('/admin/sessions/:sessionId/review', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reviewStatus, reviewNotes } = req.body; // 'approved' or 'rejected'
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.reviewStatus = reviewStatus;
    session.reviewNotes = reviewNotes;
    session.reviewDate = new Date();
    session.updatedAt = new Date();
    
    await session.save();
    
    res.json({
      success: true,
      message: `Profile ${reviewStatus} successfully`,
      session,
    });
    
  } catch (error) {
    console.error('Error reviewing profile:', error);
    res.status(500).json({ success: false, message: 'Failed to review profile' });
  }
});

// ============= INTERVIEWER MANAGEMENT =============

// Get all interviewers
router.get('/admin/interviewers', async (req, res) => {
  try {
    const interviewers = await Interviewer.find({ active: true })
      .populate('assignedSessions')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: interviewers.length,
      interviewers,
    });
    
  } catch (error) {
    console.error('Error fetching interviewers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interviewers' });
  }
});

// Add new interviewer
router.post('/admin/interviewers', async (req, res) => {
  try {
    const { name, email, bio, profilePhoto } = req.body;
    
    const interviewer = new Interviewer({
      name,
      email,
      bio,
      profilePhoto,
    });
    
    await interviewer.save();
    
    res.json({
      success: true,
      message: 'Interviewer added successfully',
      interviewer,
    });
    
  } catch (error) {
    console.error('Error adding interviewer:', error);
    res.status(500).json({ success: false, message: 'Failed to add interviewer' });
  }
});

// Update interviewer
router.patch('/admin/interviewers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const interviewer = await Interviewer.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true }
    );
    
    if (!interviewer) {
      return res.status(404).json({ success: false, message: 'Interviewer not found' });
    }
    
    res.json({
      success: true,
      message: 'Interviewer updated successfully',
      interviewer,
    });
    
  } catch (error) {
    console.error('Error updating interviewer:', error);
    res.status(500).json({ success: false, message: 'Failed to update interviewer' });
  }
});

// Delete/deactivate interviewer
router.delete('/admin/interviewers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const interviewer = await Interviewer.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    
    if (!interviewer) {
      return res.status(404).json({ success: false, message: 'Interviewer not found' });
    }
    
    res.json({
      success: true,
      message: 'Interviewer deactivated successfully',
    });
    
  } catch (error) {
    console.error('Error deleting interviewer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete interviewer' });
  }
});

module.exports = router;
