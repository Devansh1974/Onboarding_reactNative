const express = require('express');
const router = express.Router();
const { Session, Interviewer, AvailableSlots } = require('../models');

// ============= SESSION/BOOKING ENDPOINTS =============

// Get user's session status
router.get('/sessions/user/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const session = await Session.findOne({ userId: phoneNumber })
      .populate('interviewer')
      .sort({ createdAt: -1 });
    
    if (!session) {
      return res.json({
        success: true,
        session: null,
        status: 'not_scheduled',
      });
    }
    
    res.json({
      success: true,
      session,
      status: session.status,
    });
    
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
});

// Get available time slots for a date
router.get('/sessions/slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Default time slots
    const defaultSlots = [
      '11:00 AM', '11:30 AM',
      '1:00 PM', '1:30 PM',
      '3:00 PM', '3:30 PM',
      '4:30 PM',
      '6:00 PM', '6:30 PM',
      '7:00 PM', '7:30 PM',
    ];
    
    // Check which slots are already booked
    const bookedSessions = await Session.find({
      scheduledDate: date,
      status: { $in: ['scheduled', 'completed'] },
    });
    
    const bookedTimes = bookedSessions.map(s => s.scheduledTime);
    
    const availableSlots = defaultSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time),
    }));
    
    res.json({
      success: true,
      date,
      slots: availableSlots,
    });
    
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch slots' });
  }
});

// Book a session
router.post('/sessions/book', async (req, res) => {
  try {
    const { phoneNumber, userName, userEmail, scheduledDate, scheduledTime } = req.body;
    
    // Check if user already has a session
    const existingSession = await Session.findOne({ 
      userId: phoneNumber,
      status: { $in: ['scheduled', 'not_scheduled'] }
    });
    
    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a session booked' 
      });
    }
    
    // Create new session
    const session = new Session({
      userId: phoneNumber,
      userName,
      userEmail,
      scheduledDate,
      scheduledTime,
      status: 'scheduled',
      bookedAt: new Date(),
    });
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Session booked successfully',
      session,
    });
    
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ success: false, message: 'Failed to book session' });
  }
});

// Reschedule a session
router.post('/sessions/reschedule', async (req, res) => {
  try {
    const { phoneNumber, newDate, newTime, reason } = req.body;
    
    const session = await Session.findOne({ userId: phoneNumber, status: 'scheduled' });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'No scheduled session found' });
    }
    
    // Store previous session details
    session.previousSessions.push({
      date: session.scheduledDate,
      time: session.scheduledTime,
      reason,
      rescheduledAt: new Date(),
    });
    
    // Update session
    session.scheduledDate = newDate;
    session.scheduledTime = newTime;
    session.rescheduleReason = reason;
    session.rescheduleCount += 1;
    session.status = 'rescheduled';
    session.updatedAt = new Date();
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Session rescheduled successfully',
      session,
    });
    
  } catch (error) {
    console.error('Error rescheduling session:', error);
    res.status(500).json({ success: false, message: 'Failed to reschedule session' });
  }
});

// Cancel a session
router.post('/sessions/cancel', async (req, res) => {
  try {
    const { phoneNumber, reason } = req.body;
    
    const session = await Session.findOne({ userId: phoneNumber, status: 'scheduled' });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'No scheduled session found' });
    }
    
    session.status = 'cancelled';
    session.rescheduleReason = reason;
    session.updatedAt = new Date();
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Session cancelled successfully',
    });
    
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel session' });
  }
});

// Mark session as completed
router.post('/sessions/complete', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.status = 'completed';
    session.reviewStatus = 'under_review';
    session.completedAt = new Date();
    session.updatedAt = new Date();
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Session marked as completed',
      session,
    });
    
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ success: false, message: 'Failed to complete session' });
  }
});

module.exports = router;
