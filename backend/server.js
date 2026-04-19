const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'wingmann';

mongoose.connect(MONGO_URL, {
  dbName: DB_NAME,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');
const matchRoutes = require('./routes/matchRoutes');
const photoRoutes = require('./routes/photoRoutes');

// Basic routes
app.get('/api', (req, res) => {
  res.json({ message: 'WingMann API v2.0 - Node.js + Interview System', status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Use route modules
app.use('/api', userRoutes);
app.use('/api', sessionRoutes);
app.use('/api', adminRoutes);
app.use('/api', matchRoutes);
app.use('/api', photoRoutes);

// Error handling
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
  console.log(`📋 Features: Onboarding + Interview Scheduling + Admin Panel + Compatibility Matching`);
});
