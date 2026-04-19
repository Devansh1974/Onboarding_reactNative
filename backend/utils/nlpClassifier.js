/**
 * NLP Classifier for Question 5 (Descriptive)
 * 
 * Classifies free-text answers into 7 relationship value categories
 * using keyword matching. Phase 1 implementation — can be upgraded
 * to embeddings / ML in the future.
 */

// Category definitions with numeric IDs matching Q5 matching rules
const CATEGORIES = {
  1: {
    name: 'Emotional',
    keywords: [
      'love', 'care', 'affection', 'warmth', 'emotional support',
      'kindness', 'compassion', 'maturity', 'empathy', 'feelings',
      'emotional', 'sensitive', 'tender', 'nurture', 'gentle',
      'caring', 'loving', 'deep connection', 'emotional bond',
    ],
  },
  2: {
    name: 'Trust & Integrity',
    keywords: [
      'honesty', 'loyalty', 'transparency', 'dependability',
      'faithfulness', 'reliability', 'trust', 'truthful', 'honest',
      'loyal', 'faithful', 'reliable', 'integrity', 'dependable',
      'trustworthy', 'sincere', 'genuine', 'authentic',
    ],
  },
  3: {
    name: 'Communication & Understanding',
    keywords: [
      'openness', 'communication', 'listening', 'understanding',
      'expressing', 'patience', 'dialogue', 'talk', 'listen',
      'communicate', 'conversation', 'discuss', 'open up', 'share',
      'patient', 'understanding', 'express', 'articulate',
    ],
  },
  4: {
    name: 'Respect & Equality',
    keywords: [
      'support', 'respect', 'equality', 'appreciation',
      'independence', 'space', 'boundaries', 'mutual',
      'equal', 'boundary', 'autonomy', 'dignity', 'value',
      'appreciate', 'personal space', 'individual', 'freedom',
    ],
  },
  5: {
    name: 'Growth & Companionship',
    keywords: [
      'growth', 'teamwork', 'adaptive', 'flexible', 'supporting goals',
      'solving', 'companionship', 'partner', 'team', 'together',
      'evolve', 'improve', 'develop', 'learn', 'build',
      'companion', 'journey', 'progress', 'ambition', 'motivation',
    ],
  },
  6: {
    name: 'Fun & Connection',
    keywords: [
      'sex', 'adventure', 'chemistry', 'humour', 'humor',
      'emotional connection', 'sharing experiences', 'fun',
      'excitement', 'thrill', 'playful', 'enjoy', 'laugh',
      'spontaneous', 'travel', 'explore', 'passion', 'spark',
      'vibe', 'energy', 'date',
    ],
  },
  7: {
    name: 'Stability',
    keywords: [
      'commitment', 'safety', 'consistency', 'partnership',
      'togetherness', 'stability', 'secure', 'stable', 'steady',
      'safe', 'committed', 'dedicated', 'long-term', 'forever',
      'serious', 'settle', 'future', 'marriage', 'family',
    ],
  },
};

// Human-readable category name by ID
const CATEGORY_NAMES = Object.fromEntries(
  Object.entries(CATEGORIES).map(([id, cat]) => [Number(id), cat.name])
);

/**
 * Classify a free-text answer into one of the 7 categories.
 * Returns the category number (1–7).
 * Defaults to 1 (Emotional) if no keywords match.
 */
function classifyAnswer(text) {
  if (!text || typeof text !== 'string') return 1;

  const normalised = text.toLowerCase().trim();

  // Score each category by how many keywords match
  let bestCategory = 1;
  let bestScore = 0;

  for (const [catId, cat] of Object.entries(CATEGORIES)) {
    let score = 0;
    for (const keyword of cat.keywords) {
      if (normalised.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = Number(catId);
    }
  }

  return bestCategory;
}

module.exports = {
  classifyAnswer,
  CATEGORIES,
  CATEGORY_NAMES,
};
