const mongoose = require('mongoose');

// Interviewer Schema
const interviewerSchema = new mongoose.Schema({
  id: { type: String, default: () => require('crypto').randomUUID() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePhoto: String,
  bio: String,
  availability: [{
    date: String, // YYYY-MM-DD
    slots: [String] // ["11:00 AM", "1:30 PM", ...]
  }],
  assignedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Session/Booking Schema
const sessionSchema = new mongoose.Schema({
  id: { type: String, default: () => require('crypto').randomUUID() },
  userId: { type: String, required: true }, // User's phone number
  userName: String,
  userEmail: String,
  
  // Session Details
  status: { 
    type: String, 
    enum: ['not_scheduled', 'scheduled', 'completed', 'missed', 'cancelled', 'rescheduled'],
    default: 'not_scheduled'
  },
  
  // Scheduling
  scheduledDate: String, // YYYY-MM-DD
  scheduledTime: String, // "3:00 PM"
  duration: { type: Number, default: 30 }, // minutes
  
  // Interviewer Assignment
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Interviewer' },
  interviewerName: String,
  
  // Meeting Details
  meetingLink: String, // Google Meet link added by admin
  meetingPlatform: { type: String, default: 'Google Meet' },
  
  // Review Status
  reviewStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewDate: Date,
  reviewNotes: String,
  
  // Reschedule
  rescheduleReason: String,
  rescheduleCount: { type: Number, default: 0 },
  previousSessions: [{
    date: String,
    time: String,
    reason: String,
    rescheduledAt: Date,
  }],
  
  // Timestamps
  bookedAt: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash this!
  name: { type: String, default: 'Admin' },
  role: { type: String, default: 'admin' },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
});

// Available Slots Schema (for calendar)
const availableSlotsSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  slots: [{
    time: String, // "11:00 AM"
    available: { type: Boolean, default: true },
    bookedBy: String, // userId
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Interviewer: mongoose.model('Interviewer', interviewerSchema),
  Session: mongoose.model('Session', sessionSchema),
  Admin: mongoose.model('Admin', adminSchema),
  AvailableSlots: mongoose.model('AvailableSlots', availableSlotsSchema),
};
