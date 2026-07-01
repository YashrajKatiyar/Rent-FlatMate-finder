const Anthropic = require('@anthropic-ai/sdk');

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Rule-based fallback scoring — used when the LLM is unavailable or returns
 * a malformed response. Pure function, deterministic, no external calls.
 */
function ruleBasedScore(tenantProfile, listing) {
  let score = 100;
  const reasons = [];

  // Budget scoring: penalize based on how far rent falls outside [budgetMin, budgetMax]
  const { budgetMin, budgetMax } = tenantProfile;
  const { rent } = listing;
  if (rent < budgetMin) {
    // Under-budget is fine, tiny bonus note, no penalty
    reasons.push('Rent is comfortably within budget.');
  } else if (rent > budgetMax) {
    const overBy = rent - budgetMax;
    const overPct = overBy / budgetMax;
    const penalty = Math.min(60, Math.round(overPct * 100 * 1.5));
    score -= penalty;
    reasons.push(`Rent exceeds tenant's max budget by about ${Math.round(overPct * 100)}%.`);
  } else {
    reasons.push('Rent falls within the tenant\'s budget range.');
  }

  // Location scoring: simple case-insensitive substring/equality match
  const tenantLoc = (tenantProfile.preferredLocation || '').trim().toLowerCase();
  const listingLoc = (listing.location || '').trim().toLowerCase();
  if (tenantLoc && listingLoc) {
    if (tenantLoc === listingLoc) {
      reasons.push('Location matches exactly.');
    } else if (listingLoc.includes(tenantLoc) || tenantLoc.includes(listingLoc)) {
      score -= 10;
      reasons.push('Location partially matches.');
    } else {
      score -= 35;
      reasons.push('Location does not match preferred area.');
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    explanation: `[Rule-based fallback] ${reasons.join(' ')}`,
  };
}

/**
 * Calls Claude to compute a compatibility score. Falls back to rule-based
 * scoring on any failure (network error, timeout, malformed JSON, missing key).
 */
async function computeCompatibilityScore(tenantProfile, listing) {
  if (!anthropic) {
    return { ...ruleBasedScore(tenantProfile, listing), source: 'rule-based' };
  }

  const prompt = `Given this room listing: ${JSON.stringify({
    location: listing.location,
    rent: listing.rent,
    roomType: listing.roomType,
    furnishingStatus: listing.furnishingStatus,
    availableFrom: listing.availableFrom,
  })} and this tenant profile: ${JSON.stringify({
    preferredLocation: tenantProfile.preferredLocation,
    budgetMin: tenantProfile.budgetMin,
    budgetMax: tenantProfile.budgetMax,
    moveInDate: tenantProfile.moveInDate,
  })}, compute a compatibility score from 0 to 100 based on budget and location match. Return ONLY valid JSON in this exact shape, no other text: { "score": number, "explanation": string }`;

  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock) throw new Error('LLM returned no text content');

    const cleaned = textBlock.text.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.score !== 'number' ||
      parsed.score < 0 ||
      parsed.score > 100 ||
      typeof parsed.explanation !== 'string'
    ) {
      throw new Error('LLM response failed shape validation');
    }

    return { score: Math.round(parsed.score), explanation: parsed.explanation, source: 'llm' };
  } catch (err) {
    console.error(`LLM scoring failed, falling back to rule-based: ${err.message}`);
    return { ...ruleBasedScore(tenantProfile, listing), source: 'rule-based' };
  }
}

module.exports = { computeCompatibilityScore, ruleBasedScore };
