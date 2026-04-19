/**
 * Match Controller
 * 
 * Handles fetching and scoring compatibility matches for a user.
 * Only returns opposite-gender users with completed quizzes.
 */

const mongoose = require('mongoose');
const { calculateCompatibility } = require('../utils/compatibilityEngine');

// Re-use the User model from the users route (same collection)
function getUserModel() {
  return mongoose.model('User');
}

/**
 * GET /api/matches/:phoneNumber
 * 
 * Returns sorted compatibility matches for the given user.
 */
async function getMatches(req, res) {
  try {
    const { phoneNumber } = req.params;
    const User = getUserModel();

    // 1. Fetch current user
    const currentUser = await User.findOne({ phoneNumber }).select('-otp');
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 2. Validate quiz completion
    const quiz = currentUser.compatibilityQuiz;
    if (!quiz || !quiz.lifestyleAndValues || !quiz.emotionalCommunication ||
        !quiz.attachmentAndComfort || !quiz.conflictAndRepair || !quiz.growthAndReadiness) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the compatibility quiz first',
      });
    }

    // 3. Determine target gender (opposite gender matching)
    const currentGender = (currentUser.gender || '').toLowerCase();
    let targetGender;
    if (currentGender === 'male') {
      targetGender = 'female';
    } else if (currentGender === 'female') {
      targetGender = 'male';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Gender information is required for matching',
      });
    }

    // 4. Fetch opposite-gender candidates with completed quizzes
    const candidates = await User.find({
      phoneNumber: { $ne: phoneNumber },
      gender: { $regex: new RegExp(`^${targetGender}$`, 'i') },
      'compatibilityQuiz.lifestyleAndValues': { $exists: true, $ne: null },
      'compatibilityQuiz.emotionalCommunication': { $exists: true, $ne: null },
      'compatibilityQuiz.attachmentAndComfort': { $exists: true, $ne: null },
      'compatibilityQuiz.conflictAndRepair': { $exists: true, $ne: null },
      'compatibilityQuiz.growthAndReadiness': { $exists: true, $ne: null },
    }).select('-otp').limit(100);

    // 5. Score each candidate
    const matches = [];

    for (const candidate of candidates) {
      try {
        const result = calculateCompatibility(
          currentUser.compatibilityQuiz,
          candidate.compatibilityQuiz
        );

        matches.push({
          userId: candidate.id || candidate._id.toString(),
          phoneNumber: candidate.phoneNumber,
          name: candidate.name || 'Anonymous',
          gender: candidate.gender,
          location: candidate.location || '',
          birthday: candidate.birthday || '',
          education: candidate.education || '',
          story: candidate.story || '',
          interests: candidate.interests || [],
          photos: candidate.photos || [],
          workDetails: candidate.workDetails || {},
          studyDetails: candidate.studyDetails || {},
          timeUsage: candidate.timeUsage || '',
          nonNegotiables: candidate.nonNegotiables || [],
          offerings: candidate.offerings || [],
          lifestyle: candidate.lifestyle || {},
          height: candidate.height || null,
          nativeState: candidate.nativeState || '',
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage,
          pillarScores: result.pillarScores,
          reasons: result.reasons,
        });
      } catch (err) {
        console.error(`Error scoring candidate ${candidate.phoneNumber}:`, err.message);
        // Skip this candidate, continue with others
      }
    }

    // 6. Sort by percentage DESC
    matches.sort((a, b) => b.percentage - a.percentage);

    return res.json({
      success: true,
      count: matches.length,
      currentUser: {
        phoneNumber: currentUser.phoneNumber,
        name: currentUser.name,
        gender: currentUser.gender,
      },
      matches,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: error.message,
    });
  }
}

module.exports = {
  getMatches,
};
