/**
 * Match Routes
 * 
 * GET /api/matches/:phoneNumber — Returns sorted compatibility matches
 */

const express = require('express');
const router = express.Router();
const { getMatches } = require('../controllers/matchController');

// Get matches for a user
router.get('/matches/:phoneNumber', getMatches);

module.exports = router;
