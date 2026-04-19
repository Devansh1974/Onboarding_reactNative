/**
 * Compatibility Matching Engine
 * 
 * Rule-based scoring engine for 25 compatibility quiz questions.
 * Total max weight = 200 points.
 * 
 * Scoring: high = weight × 2, moderate = weight × 1, low = 0
 * Percentage = (totalScore / 400) × 100   [400 = 200 × 2]
 */

const { classifyAnswer, CATEGORY_NAMES } = require('./nlpClassifier');

// ──────────────────────────── QUESTION CONFIG ────────────────────────────
// Maps each of the 25 algorithm questions to their DB location and type.
// MCQ questions include a mapping from the frontend string IDs to numeric values.

const QUESTION_CONFIG = [
  // ── Lifestyle & Values (Q1–Q5) ──
  { qNum: 1,  weight: 3,  type: 'mcq',        section: 'lifestyleAndValues',    key: 'q1', pillar: 'Lifestyle',
    mcqMap: { home: 1, explore: 2, productive: 3, mood: 4 } },
  { qNum: 2,  weight: 5,  type: 'mcq',        section: 'lifestyleAndValues',    key: 'q2', pillar: 'Lifestyle',
    mcqMap: { together: 1, open: 2, split: 3, separate: 4 } },
  { qNum: 3,  weight: 4,  type: 'latent',     section: 'lifestyleAndValues',    key: 'q3', pillar: 'Lifestyle' },
  { qNum: 4,  weight: 4,  type: 'latent',     section: 'lifestyleAndValues',    key: 'q4', pillar: 'Lifestyle' },
  { qNum: 5,  weight: 5,  type: 'descriptive', section: 'lifestyleAndValues',   key: 'q5', pillar: 'Lifestyle' },

  // ── Emotional Communication (Q6–Q10) ──
  { qNum: 6,  weight: 4,  type: 'mcq',        section: 'emotionalCommunication', key: 'q1', pillar: 'Communication',
    mcqMap: { quiet: 1, talk: 2, distract: 3, wait: 4 } },
  { qNum: 7,  weight: 4,  type: 'mcq',        section: 'emotionalCommunication', key: 'q2', pillar: 'Communication',
    mcqMap: { time: 1, gifts: 2, checking: 3, support: 4 } },
  { qNum: 8,  weight: 4,  type: 'latent',     section: 'emotionalCommunication', key: 'q3', pillar: 'Communication' },
  { qNum: 9,  weight: 5,  type: 'latent',     section: 'emotionalCommunication', key: 'q4', pillar: 'Communication' },
  { qNum: 10, weight: 4,  type: 'latent',     section: 'emotionalCommunication', key: 'q5', pillar: 'Communication' },

  // ── Attachment & Comfort Zone (Q11–Q16) ──
  { qNum: 11, weight: 5,  type: 'latent',     section: 'attachmentAndComfort',   key: 'q1', pillar: 'Attachment' },
  { qNum: 12, weight: 4,  type: 'latent',     section: 'attachmentAndComfort',   key: 'q2', pillar: 'Attachment' },
  { qNum: 13, weight: 4,  type: 'latent',     section: 'attachmentAndComfort',   key: 'q3', pillar: 'Attachment' },
  { qNum: 14, weight: 2,  type: 'mcq',        section: 'attachmentAndComfort',   key: 'q4', pillar: 'Attachment',
    mcqMap: { alone: 1, talk: 2, distract: 3, busy: 4 } },
  { qNum: 15, weight: 4,  type: 'mcq',        section: 'attachmentAndComfort',   key: 'q5', pillar: 'Attachment',
    mcqMap: { calm: 1, anxious: 2, unbothered: 3, irritated: 4 } },
  { qNum: 16, weight: 5,  type: 'latent',     section: 'attachmentAndComfort',   key: 'q6', pillar: 'Attachment' },

  // ── Conflict & Repair Patterns (Q17–Q20) ──
  { qNum: 17, weight: 4,  type: 'latent',     section: 'conflictAndRepair',      key: 'q1', pillar: 'Conflict' },
  { qNum: 18, weight: 5,  type: 'mcq',        section: 'conflictAndRepair',      key: 'q2', pillar: 'Conflict',
    mcqMap: { avoid: 1, address: 2, compromise: 3, reflect: 4 } },
  { qNum: 19, weight: 4,  type: 'latent',     section: 'conflictAndRepair',      key: 'q3', pillar: 'Conflict' },
  { qNum: 20, weight: 2,  type: 'latent',     section: 'conflictAndRepair',      key: 'q4', pillar: 'Conflict' },

  // ── Growth, Readiness & Emotional Maturity (Q21–Q25) ──
  { qNum: 21, weight: 5,  type: 'latent',     section: 'growthAndReadiness',     key: 'q1', pillar: 'Growth' },
  { qNum: 22, weight: 5,  type: 'latent',     section: 'growthAndReadiness',     key: 'q2', pillar: 'Growth' },
  { qNum: 23, weight: 3,  type: 'latent',     section: 'growthAndReadiness',     key: 'q3', pillar: 'Growth' },
  { qNum: 24, weight: 3,  type: 'mcq',        section: 'growthAndReadiness',     key: 'q4', pillar: 'Growth',
    mcqMap: { meaningful: 1, cautious: 2, exploring: 3, healing: 4 } },
  { qNum: 25, weight: 3,  type: 'mcq',        section: 'growthAndReadiness',     key: 'q5', pillar: 'Growth',
    mcqMap: { past: 1, family: 2, growth: 3, media: 4 } },
];

// Total max score = sum of all weights × 2 (high match for every question)
const MAX_SCORE = QUESTION_CONFIG.reduce((sum, q) => sum + q.weight * 2, 0); // = 400
const TOTAL_WEIGHT = QUESTION_CONFIG.reduce((sum, q) => sum + q.weight, 0);  // = 200 (verify)


// ──────────────────────────── MATCHING RULES ────────────────────────────
// Each rule set maps question number → { high: [[a,b],...], moderate: [...], low: [...] }
// Rules are bidirectional — we check both (a1,a2) and (a2,a1).

const MATCHING_RULES = {
  1: {
    high:     [[1,1],[2,2],[3,3],[4,4]],
    moderate: [[1,4],[2,4],[3,4]],
    low:      [[1,2],[1,3],[2,3]],
  },
  2: {
    high:     [[1,1],[3,3],[1,3],[2,2]],
    moderate: [[2,3],[2,1]],
    low:      [[1,4],[2,4],[3,4],[4,4]],
  },
  3: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  4: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  // Q5 uses separate Q5_RULES via NLP classification
  5: null,
  6: {
    high:     [[1,1],[2,2],[2,4]],
    moderate: [[1,3],[1,2]],
    low:      [[3,3],[3,4],[4,4],[2,3],[1,4]],
  },
  7: {
    high:     [[1,1],[2,2],[3,3],[4,4],[1,4]],
    moderate: [[1,3],[2,4]],
    low:      [[1,2],[2,3],[3,4]],
  },
  8: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  9: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  10: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  11: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  12: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  13: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  14: {
    high:     [[1,1],[2,2]],
    moderate: [[1,2],[1,3],[1,4]],
    low:      [[3,3],[2,4],[2,3],[4,4],[3,4]],
  },
  15: {
    high:     [[1,1]],
    moderate: [[2,2],[1,2],[1,3],[1,4]],
    low:      [[3,3],[3,4],[4,3],[2,3],[3,2],[4,4],[2,4],[4,2]],
  },
  16: {
    high:     [[1,1],[2,2],[3,3],[4,4],[5,5],[1,2],[4,5]],
    moderate: [[1,3],[2,3],[3,4],[3,5]],
    low:      [[1,4],[1,5],[2,4],[2,5]],
  },
  17: {
    high:     [[4,4],[5,5],[4,5]],
    moderate: [[1,3],[2,3],[3,3],[3,4],[3,5]],
    low:      [[1,1],[2,2],[1,2],[1,4],[1,5],[2,4],[2,5]],
  },
  18: {
    high:     [[2,2],[3,3],[4,4]],
    moderate: [[3,4],[2,3]],
    low:      [[1,1],[2,4],[1,2],[1,3],[1,4]],
  },
  19: {
    high:     [[1,1],[2,2],[1,2]],
    moderate: [[1,3],[2,3],[3,3],[3,4],[3,5]],
    low:      [[4,4],[5,5],[4,5],[2,4],[2,5],[1,4],[1,5]],
  },
  20: {
    high:     [[1,1],[2,2],[1,2],[4,4],[5,5],[4,5]],
    moderate: [[1,3],[2,3],[3,3],[2,4],[1,4]],
    low:      [[1,5],[2,5],[4,3],[5,3]],
  },
  21: {
    high:     [[4,4],[5,5],[4,5]],
    moderate: [[3,3],[3,4],[3,5],[2,3],[1,3]],
    low:      [[1,1],[2,2],[1,2],[1,4],[1,5],[2,4],[2,5]],
  },
  22: {
    high:     [[4,4],[5,5],[4,5]],
    moderate: [[3,3],[3,4],[3,5],[1,3]],
    low:      [[1,1],[2,2],[1,2],[2,3],[2,4],[2,5],[1,5],[1,4]],
  },
  23: {
    high:     [[1,1],[2,2],[1,3],[2,3],[1,2]],
    moderate: [[3,4],[3,5],[3,3],[4,4]],
    low:      [[5,5],[1,5],[2,5],[1,4],[2,4],[4,5]],
  },
  24: {
    high:     [[1,1]],
    moderate: [[1,2],[1,4],[2,2],[4,4],[3,3]],
    low:      [[2,4],[2,3],[3,4],[1,3]],
  },
  25: {
    high:     [[1,1],[3,3],[1,3]],
    moderate: [[2,2],[1,2],[4,4],[2,3],[3,4]],
    low:      [[1,4],[2,4]],
  },
};

// Q5 rules — uses category numbers from NLP classifier
const Q5_RULES = {
  high: [
    [1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],
    [1,2],[1,3],[1,4],[1,5],[1,7],[2,3],[4,3],[5,3],[7,3],[2,5],[2,7],[4,5],[5,7],
  ],
  moderate: [
    [2,4],[4,7],
  ],
  low: [
    [6,1],[6,2],[6,3],[6,4],[6,5],[6,7],
  ],
};

// Pillar display names for reasons
const PILLAR_DISPLAY = {
  Lifestyle:     'Lifestyle & Values',
  Communication: 'Emotional Communication',
  Attachment:    'Attachment & Comfort',
  Conflict:      'Conflict Resolution',
  Growth:        'Growth & Maturity',
};


// ──────────────────────────── SCORING FUNCTIONS ────────────────────────────

/**
 * Check if a pair exists in a rules array (bidirectional).
 */
function pairMatch(pairs, a1, a2) {
  return pairs.some(([x, y]) => (x === a1 && y === a2) || (x === a2 && y === a1));
}

/**
 * Score an MCQ or Latent question using predefined rules.
 */
function getRuleBasedScore(a1, a2, weight, rules) {
  if (a1 == null || a2 == null) return 0;

  if (pairMatch(rules.high, a1, a2)) return weight * 2;
  if (pairMatch(rules.moderate, a1, a2)) return weight * 1;
  // low or unlisted → 0
  return 0;
}

/**
 * Score Q5 (descriptive) using NLP classification + Q5 rules.
 */
function getDescriptiveScore(text1, text2, weight) {
  const cat1 = classifyAnswer(text1);
  const cat2 = classifyAnswer(text2);

  if (pairMatch(Q5_RULES.high, cat1, cat2)) return { score: weight * 2, cat1, cat2 };
  if (pairMatch(Q5_RULES.moderate, cat1, cat2)) return { score: weight * 1, cat1, cat2 };
  return { score: 0, cat1, cat2 };
}

/**
 * Convert MCQ string ID to numeric value.
 */
function convertMCQToNumeric(value, mcqMap) {
  if (typeof value === 'number') return value;
  if (!mcqMap || !value) return null;
  return mcqMap[value] || null;
}

/**
 * Flatten the nested quiz object into a flat map of question number → answer value.
 * 
 * DB structure:
 * {
 *   lifestyleAndValues: { q1: 'home', q2: 'open', q3: 4, q4: 3, q5: 'honesty...' },
 *   emotionalCommunication: { q1: 'quiet', q2: 'time', q3: 3, q4: 4, q5: 5 },
 *   attachmentAndComfort: { q1: 3, q2: 4, q3: 2, q4: 'alone', q5: 'calm', q6: 5 },
 *   conflictAndRepair: { q1: 4, q2: 'address', q3: 2, q4: 3 },
 *   growthAndReadiness: { q1: 5, q2: 4, q3: 2, q4: 'meaningful', q5: 'past' },
 * }
 */
function flattenQuizAnswers(quiz) {
  if (!quiz) return {};

  const flat = {};
  for (const config of QUESTION_CONFIG) {
    const sectionData = quiz[config.section];
    if (sectionData && sectionData[config.key] !== undefined) {
      flat[config.qNum] = sectionData[config.key];
    }
  }
  return flat;
}


// ──────────────────────────── MAIN COMPATIBILITY FUNCTION ────────────────

/**
 * Calculate compatibility between two users.
 * 
 * @param {Object} quiz1 - User 1's compatibilityQuiz object from DB
 * @param {Object} quiz2 - User 2's compatibilityQuiz object from DB
 * @returns {{ score: number, percentage: number, pillarScores: Object, reasons: string[] }}
 */
function calculateCompatibility(quiz1, quiz2) {
  const flat1 = flattenQuizAnswers(quiz1);
  const flat2 = flattenQuizAnswers(quiz2);

  let totalScore = 0;
  const pillarScores = {};   // pillar → { earned, maxPossible }
  const pillarDetails = {};  // pillar → array of per-question results

  for (const config of QUESTION_CONFIG) {
    const { qNum, weight, type, pillar, mcqMap } = config;

    // Initialise pillar tracking
    if (!pillarScores[pillar]) {
      pillarScores[pillar] = { earned: 0, maxPossible: 0 };
      pillarDetails[pillar] = [];
    }
    pillarScores[pillar].maxPossible += weight * 2;

    let qScore = 0;

    if (type === 'descriptive') {
      // Q5 — NLP classification
      const result = getDescriptiveScore(flat1[qNum], flat2[qNum], weight);
      qScore = result.score;
    } else {
      // MCQ or Latent — use predefined rules
      const rules = MATCHING_RULES[qNum];
      if (!rules) continue; // safety

      let a1 = flat1[qNum];
      let a2 = flat2[qNum];

      // Convert MCQ strings to numbers
      if (type === 'mcq' && mcqMap) {
        a1 = convertMCQToNumeric(a1, mcqMap);
        a2 = convertMCQToNumeric(a2, mcqMap);
      }

      // Ensure latent values are numbers
      if (type === 'latent') {
        a1 = typeof a1 === 'number' ? a1 : parseInt(a1);
        a2 = typeof a2 === 'number' ? a2 : parseInt(a2);
        if (isNaN(a1) || isNaN(a2)) {
          a1 = null;
          a2 = null;
        }
      }

      qScore = getRuleBasedScore(a1, a2, weight, rules);
    }

    totalScore += qScore;
    pillarScores[pillar].earned += qScore;
    pillarDetails[pillar].push({
      qNum,
      score: qScore,
      maxScore: weight * 2,
      matchLevel: qScore === weight * 2 ? 'high' : qScore === weight ? 'moderate' : 'low',
    });
  }

  // Calculate percentage
  const percentage = Math.round((totalScore / MAX_SCORE) * 100);

  // Generate pillar percentages
  const pillarPercentages = {};
  for (const [pillar, data] of Object.entries(pillarScores)) {
    pillarPercentages[pillar] = {
      percentage: data.maxPossible > 0 ? Math.round((data.earned / data.maxPossible) * 100) : 0,
      earned: data.earned,
      maxPossible: data.maxPossible,
      displayName: PILLAR_DISPLAY[pillar] || pillar,
    };
  }

  // Generate human-readable reasons
  const reasons = generateReasons(pillarPercentages);

  return {
    score: totalScore,
    maxScore: MAX_SCORE,
    percentage,
    pillarScores: pillarPercentages,
    reasons,
  };
}


/**
 * Generate human-readable compatibility reasons based on pillar scores.
 */
function generateReasons(pillarPercentages) {
  const reasons = [];

  const descriptors = {
    Lifestyle:     { high: 'Strong lifestyle alignment', moderate: 'Decent lifestyle compatibility', low: 'Different lifestyle preferences' },
    Communication: { high: 'Excellent communication match', moderate: 'Similar communication style', low: 'Different communication approaches' },
    Attachment:    { high: 'Great emotional compatibility', moderate: 'Fair attachment alignment', low: 'Different attachment styles' },
    Conflict:      { high: 'Healthy conflict resolution match', moderate: 'Moderate conflict handling', low: 'Different conflict approaches' },
    Growth:        { high: 'Aligned growth mindset', moderate: 'Shared growth values', low: 'Different growth perspectives' },
  };

  for (const [pillar, data] of Object.entries(pillarPercentages)) {
    const desc = descriptors[pillar];
    if (!desc) continue;

    if (data.percentage >= 70) {
      reasons.push(desc.high);
    } else if (data.percentage >= 40) {
      reasons.push(desc.moderate);
    }
    // low — no reason added (keep it positive)
  }

  if (reasons.length === 0) {
    reasons.push('Exploring potential compatibility');
  }

  return reasons;
}


module.exports = {
  calculateCompatibility,
  flattenQuizAnswers,
  QUESTION_CONFIG,
  MAX_SCORE,
  TOTAL_WEIGHT,
};
