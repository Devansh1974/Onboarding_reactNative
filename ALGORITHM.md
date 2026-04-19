# WingMann Compatibility Matching Algorithm — Technical Documentation

## Overview

The WingMann compatibility matching engine is a **rule-based scoring system** that calculates compatibility between two users based on their responses to a **25-question compatibility quiz**. The algorithm produces a percentage score (0–100%) along with pillar-level breakdowns and human-readable match reasons.

---

## Architecture

```
User A Quiz Answers ──┐
                      ├──► Compatibility Engine ──► { score, percentage, pillarScores, reasons }
User B Quiz Answers ──┘
         │
         ├── MCQ Questions → Rule-based pair matching
         ├── Latent Scale Questions → Rule-based pair matching
         └── Descriptive Question (Q5) → NLP Keyword Classification → Rule-based pair matching
```

### Files

| File | Responsibility |
|------|----------------|
| `backend/utils/compatibilityEngine.js` | Core scoring logic, question config, matching rules |
| `backend/utils/nlpClassifier.js` | Keyword-based NLP text classifier for Q5 |
| `backend/controllers/matchController.js` | API handler — fetch users, run engine, sort results |
| `backend/routes/matchRoutes.js` | `GET /api/matches/:phoneNumber` endpoint |

---

## Quiz Structure

The quiz has **25 questions** across **5 sections (pillars)**:

| Pillar | Questions | DB Section Key |
|--------|-----------|----------------|
| Lifestyle & Values | Q1–Q5 | `lifestyleAndValues` |
| Emotional Communication | Q6–Q10 | `emotionalCommunication` |
| Attachment & Comfort Zone | Q11–Q16 | `attachmentAndComfort` |
| Conflict & Repair Patterns | Q17–Q20 | `conflictAndRepair` |
| Growth, Readiness & Maturity | Q21–Q25 | `growthAndReadiness` |

### Question Types

1. **MCQ (Multiple Choice)** — User picks one of 4 options. Stored as a string ID (e.g., `"home"`, `"explore"`).
2. **Latent Scale** — User rates on a 1–5 Likert scale (Strongly Disagree → Strongly Agree). Stored as a number.
3. **Descriptive** — User writes free text. Only Q5 uses this type.

---

## Scoring Formula

### Per-Question Scoring

Each question has a **weight** (2–5 points) and a **matching rule set** defining which answer pairs are high/moderate/low:

| Match Level | Score |
|-------------|-------|
| **High** | `weight × 2` |
| **Moderate** | `weight × 1` |
| **Low** | `0` |

### Total Score

```
Total Score = Σ (per-question score for all 25 questions)
Max Possible Score = Σ (weight × 2 for all 25 questions) = 200
Compatibility % = (Total Score / 200) × 100
```

### Weight Distribution

| Question | Weight | Type | Pillar |
|----------|--------|------|--------|
| Q1 (Ideal weekend) | 3 | MCQ | Lifestyle |
| Q2 (Money approach) | 5 | MCQ | Lifestyle |
| Q3 (Fitness matters) | 4 | Latent | Lifestyle |
| Q4 (Aligned goals) | 4 | Latent | Lifestyle |
| Q5 (What matters most) | 5 | Descriptive | Lifestyle |
| Q6 (When upset) | 4 | MCQ | Communication |
| Q7 (Show care) | 4 | MCQ | Communication |
| Q8 (Mood changes) | 4 | Latent | Communication |
| Q9 (Express feelings) | 5 | Latent | Communication |
| Q10 (Reach out) | 4 | Latent | Communication |
| Q11 (Worry partner loses interest) | 5 | Latent | Attachment |
| Q12 (Closeness vs space) | 4 | Latent | Attachment |
| Q13 (Hold back feelings) | 4 | Latent | Attachment |
| Q14 (When overwhelmed) | 2 | MCQ | Attachment |
| Q15 (Delayed texting) | 4 | MCQ | Attachment |
| Q16 (Feel safe sharing) | 5 | Latent | Attachment |
| Q17 (Take first step) | 4 | Latent | Conflict |
| Q18 (Handle conflict) | 5 | MCQ | Conflict |
| Q19 (Being right) | 4 | Latent | Conflict |
| Q20 (Stay calm) | 2 | Latent | Conflict |
| Q21 (Relationships grow) | 5 | Latent | Growth |
| Q22 (Take responsibility) | 5 | Latent | Growth |
| Q23 (Rarely talk emotions) | 3 | Latent | Growth |
| Q24 (Readiness) | 3 | MCQ | Growth |
| Q25 (Learned from) | 3 | MCQ | Growth |

**Total Weight = 100** → **Max Score = 200** (each weight × 2 for high match)

---

## MCQ Answer Mapping

Frontend stores MCQ answers as **string IDs**. The engine converts them to **numeric IDs** for rule matching:

### Q1 — Ideal Weekend
| Option | ID | Numeric |
|--------|----|---------|
| Stay home and recharge | `home` | 1 |
| Go out and explore | `explore` | 2 |
| Something productive | `productive` | 3 |
| Depends on mood | `mood` | 4 |

### Q2 — Money Approach
| Option | ID | Numeric |
|--------|----|---------|
| Plan together | `together` | 1 |
| Open to discuss | `open` | 2 |
| Split equally | `split` | 3 |
| Keep separate | `separate` | 4 |

### Q6 — When Upset
| Option | ID | Numeric |
|--------|----|---------|
| Go quiet | `quiet` | 1 |
| Talk it out | `talk` | 2 |
| Distract myself | `distract` | 3 |
| Wait and process | `wait` | 4 |

### Q7 — Show Care
| Option | ID | Numeric |
|--------|----|---------|
| Quality time | `time` | 1 |
| Thoughtful gifts | `gifts` | 2 |
| Regular checking in | `checking` | 3 |
| Acts of support | `support` | 4 |

### Q14 — When Overwhelmed
| Option | ID | Numeric |
|--------|----|---------|
| Time alone | `alone` | 1 |
| Talk it out | `talk` | 2 |
| Distract with hobbies | `distract` | 3 |
| Stay busy | `busy` | 4 |

### Q15 — Delayed Texting
| Option | ID | Numeric |
|--------|----|---------|
| Calm, they're busy | `calm` | 1 |
| Anxious | `anxious` | 2 |
| Unbothered | `unbothered` | 3 |
| Irritated | `irritated` | 4 |

### Q18 — Handle Conflict
| Option | ID | Numeric |
|--------|----|---------|
| Avoid it | `avoid` | 1 |
| Address directly | `address` | 2 |
| Find compromise | `compromise` | 3 |
| Reflect first | `reflect` | 4 |

### Q24 — Readiness
| Option | ID | Numeric |
|--------|----|---------|
| Ready for meaningful | `meaningful` | 1 |
| Cautious but open | `cautious` | 2 |
| Still exploring | `exploring` | 3 |
| Healing first | `healing` | 4 |

### Q25 — Learned From
| Option | ID | Numeric |
|--------|----|---------|
| Past relationships | `past` | 1 |
| Family | `family` | 2 |
| Self-growth journey | `growth` | 3 |
| Media/culture | `media` | 4 |

---

## Matching Rules

### How Rule Matching Works

Each question has predefined **answer pair tuples** categorized as high, moderate, or low. The matching is **bidirectional** — `(1,2)` also matches `(2,1)`.

```javascript
// Example: Q1 rules
{
  high:     [[1,1], [2,2], [3,3], [4,4]],       // Same answer = high
  moderate: [[1,4], [2,4], [3,4]],               // Flexible combos = moderate
  low:      [[1,2], [1,3], [2,3]],               // Mismatched = low (0 pts)
}
```

### Complete Rule Set

#### Lifestyle & Values (Q1–Q5)

**Q1** (weight 3):
- High: `(1,1) (2,2) (3,3) (4,4)` — same preference
- Moderate: `(1,4) (2,4) (3,4)` — mood-dependent pairs
- Low: `(1,2) (1,3) (2,3)` — conflicting styles

**Q2** (weight 5):
- High: `(1,1) (3,3) (1,3) (2,2)` — similar financial mindset
- Moderate: `(2,3) (2,1)` — open to discussion
- Low: `(1,4) (2,4) (3,4) (4,4)` — financial incompatibility

**Q3–Q4** (weight 4 each, latent):
- High: same/adjacent values `(1,1) (2,2) (3,3) (4,4) (5,5) (1,2) (4,5)`
- Moderate: one step apart `(1,3) (2,3) (3,4) (3,5)`
- Low: far apart `(1,4) (1,5) (2,4) (2,5)`

**Q5** — See [NLP Classification](#q5-nlp-classification) below

#### Emotional Communication (Q6–Q10)

**Q6** (weight 4):
- High: `(1,1) (2,2) (2,4)` — compatible processing styles
- Moderate: `(1,3) (1,2)`
- Low: `(3,3) (3,4) (4,4) (2,3) (1,4)`

**Q7** (weight 4):
- High: `(1,1) (2,2) (3,3) (4,4) (1,4)` — same love language or complementary
- Moderate: `(1,3) (2,4)`
- Low: `(1,2) (2,3) (3,4)`

**Q8–Q10** (latent): Standard latent rules (same as Q3–Q4)

#### Attachment & Comfort (Q11–Q16)

**Q11–Q13, Q16** (latent): Standard latent rules

**Q14** (weight 2):
- High: `(1,1) (2,2)` — same coping style
- Moderate: `(1,2) (1,3) (1,4)` — tolerant of space
- Low: `(3,3) (2,4) (2,3) (4,4) (3,4)`

**Q15** (weight 4):
- High: `(1,1)` — both calm
- Moderate: `(2,2) (1,2) (1,3) (1,4)` — one calm, other varied
- Low: `(3,3) (3,4) (4,3) (2,3) (3,2) (4,4) (2,4) (4,2)`

#### Conflict & Repair (Q17–Q20)

**Q17** (weight 4):
- High: `(4,4) (5,5) (4,5)` — both willing to initiate
- Moderate: `(1,3) (2,3) (3,3) (3,4) (3,5)` — neutral willing
- Low: `(1,1) (2,2) (1,2) (1,4) (1,5) (2,4) (2,5)` — both unwilling

**Q18** (weight 5):
- High: `(2,2) (3,3) (4,4)` — proactive styles
- Moderate: `(3,4) (2,3)` — compatible proactive styles
- Low: `(1,1) (2,4) (1,2) (1,3) (1,4)` — avoidance involved

**Q19** (weight 4):
- High: `(1,1) (2,2) (1,2)` — both don't prioritize being right
- Low: `(4,4) (5,5) (4,5) ...` — both stubborn

**Q20** (weight 2, latent): Mixed rules for calmness

#### Growth & Readiness (Q21–Q25)

**Q21** (weight 5):
- High: `(4,4) (5,5) (4,5)` — both believe in growth
- Low: `(1,1) (2,2) (1,2) ...` — both don't believe

**Q22** (weight 5): Same structure as Q21

**Q23** (weight 3):
- High: `(1,1) (2,2) (1,3) (2,3) (1,2)` — open about emotions
- Low: `(5,5) (1,5) (2,5) ...` — closed off

**Q24** (weight 3):
- High: `(1,1)` — both ready
- Moderate: `(1,2) (1,4) (2,2) (4,4) (3,3)` — somewhat aligned
- Low: `(2,4) (2,3) (3,4) (1,3)` — mismatched readiness

**Q25** (weight 3):
- High: `(1,1) (3,3) (1,3)` — experience + growth aligned
- Moderate: `(2,2) (1,2) (4,4) (2,3) (3,4)` — varied but compatible
- Low: `(1,4) (2,4)` — experience vs media mismatch

---

## Q5 NLP Classification

Q5 is a **free-text descriptive question**: "What matters most to you in a relationship?"

### Classification Method

The answer is classified into one of **7 categories** using keyword matching:

| Category | ID | Keywords (sample) |
|----------|----|-------------------|
| Emotional | 1 | love, care, affection, warmth, compassion, empathy, kindness |
| Trust & Integrity | 2 | honesty, loyalty, trust, faithful, reliable, sincere, genuine |
| Communication | 3 | communication, listening, understanding, patience, dialogue, openness |
| Respect & Equality | 4 | respect, boundaries, equality, independence, space, autonomy |
| Growth & Companionship | 5 | growth, teamwork, goals, companion, evolve, build |
| Fun & Connection | 6 | adventure, chemistry, humor, fun, spark, passion, excitement |
| Stability | 7 | commitment, safety, consistency, stability, secure, long-term, marriage |

### Algorithm

```
1. Convert text to lowercase
2. For each category, count how many keywords appear in the text
3. Return the category with the highest keyword match count
4. Default to "Emotional" (1) if no keywords match
```

### Q5 Matching Rules

| Match Level | Category Pairs |
|-------------|----------------|
| **High** | Same category `(1,1)(2,2)...`, plus cross-compatible: `(1,2)(1,3)(1,4)(1,5)(1,7)(2,3)(4,3)(5,3)(7,3)(2,5)(2,7)(4,5)(5,7)` |
| **Moderate** | `(2,4)(4,7)` — trust+respect, respect+stability |
| **Low** | `(6,*)` — "Fun" paired with any other category scores low (except same) |

**Design rationale**: Values like emotional, trust, communication, respect, growth, and stability are largely complementary. Fun/adventure as a primary value can indicate different relationship depth expectations.

---

## Data Flow

### Database → Engine

```
MongoDB User Document
  └── compatibilityQuiz: {
        lifestyleAndValues: { q1: "home", q2: "open", q3: 4, q4: 3, q5: "honesty..." },
        emotionalCommunication: { q1: "talk", q2: "time", q3: 4, q4: 4, q5: 4 },
        attachmentAndComfort: { q1: 3, q2: 3, q3: 3, q4: "alone", q5: "calm", q6: 5 },
        conflictAndRepair: { q1: 4, q2: "address", q3: 2, q4: 3 },
        growthAndReadiness: { q1: 5, q2: 5, q3: 2, q4: "meaningful", q5: "past" }
      }

         ↓ flattenQuizAnswers()

Flat Map: { 1: "home", 2: "open", 3: 4, 4: 3, 5: "honesty...", 6: "talk", ... 25: "past" }

         ↓ For each question:
           - MCQ: convertMCQToNumeric() → lookup rules → score
           - Latent: direct numeric → lookup rules → score
           - Descriptive: classifyAnswer() → lookup Q5 rules → score

         ↓ Aggregate

Result: {
  score: 142,
  maxScore: 200,
  percentage: 71,
  pillarScores: { Lifestyle: { percentage: 65, ... }, ... },
  reasons: ["Strong lifestyle alignment", "Excellent communication match", ...]
}
```

### API Response

```
GET /api/matches/:phoneNumber

1. Fetch current user
2. Validate quiz completion (all 5 sections filled)
3. Query opposite-gender users with completed quizzes  
4. For each candidate: calculateCompatibility(user.quiz, candidate.quiz)
5. Sort by percentage DESC
6. Return top matches with full profile data + scores
```

---

## Pillar Scoring

Each pillar gets its own percentage:

```
Pillar % = (earned points in pillar / max possible points in pillar) × 100
```

| Pillar | Questions | Max Points |
|--------|-----------|------------|
| Lifestyle | Q1–Q5 | (3+5+4+4+5) × 2 = 42 |
| Communication | Q6–Q10 | (4+4+4+5+4) × 2 = 42 |
| Attachment | Q11–Q16 | (5+4+4+2+4+5) × 2 = 48 |
| Conflict | Q17–Q20 | (4+5+4+2) × 2 = 30 |
| Growth | Q21–Q25 | (5+5+3+3+3) × 2 = 38 |
| **Total** | **25** | **200** |

---

## Reason Generation

Based on pillar percentages, human-readable reasons are generated:

| Pillar % | Reason Generated |
|----------|-----------------|
| ≥ 70% | "Strong lifestyle alignment" / "Excellent communication match" / etc. |
| ≥ 40% | "Decent lifestyle compatibility" / "Similar communication style" / etc. |
| < 40% | No reason added (keeps results positive) |

If no reasons qualify, defaults to: "Exploring potential compatibility"

---

## Gender Filtering

- **Males** see only **female** matches
- **Females** see only **male** matches
- Gender comparison is case-insensitive (`$regex`)
- Only users with **all 5 quiz sections completed** appear as candidates

---

## Future Upgrades

The modular architecture supports straightforward upgrades:

1. **ML-based scoring** — Replace `getRuleBasedScore()` with a trained model
2. **Embedding-based NLP** — Replace keyword classifier with HuggingFace embeddings
3. **Preference filtering** — Use the new `preferences` field to filter by age/height/language
4. **Weighted pillars** — Allow users to prioritize certain pillars
5. **Match caching** — Cache daily top-5 matches instead of recalculating on every request
