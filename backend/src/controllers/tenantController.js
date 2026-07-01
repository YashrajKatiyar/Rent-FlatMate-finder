const asyncHandler = require('express-async-handler');
const TenantProfile = require('../models/TenantProfile');
const CompatibilityScore = require('../models/CompatibilityScore');
const ApiError = require('../utils/ApiError');

// @route POST /api/tenant/profile  (create or upsert own profile)
const upsertProfile = asyncHandler(async (req, res) => {
  const { preferredLocation, budgetMin, budgetMax, moveInDate, notes } = req.body;
  if (!preferredLocation || budgetMin == null || budgetMax == null || !moveInDate) {
    throw new ApiError(400, 'preferredLocation, budgetMin, budgetMax, and moveInDate are required');
  }
  if (Number(budgetMin) > Number(budgetMax)) {
    throw new ApiError(400, 'budgetMin cannot be greater than budgetMax');
  }

  const profile = await TenantProfile.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, preferredLocation, budgetMin, budgetMax, moveInDate, notes },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Profile changed -> previously stored compatibility scores are stale, invalidate them.
  // They will be lazily recomputed the next time this tenant browses listings.
  await CompatibilityScore.deleteMany({ tenant: req.user._id });

  res.status(200).json({ success: true, data: profile });
});

// @route GET /api/tenant/profile
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await TenantProfile.findOne({ user: req.user._id });
  if (!profile) throw new ApiError(404, 'No tenant profile found; create one first');
  res.json({ success: true, data: profile });
});

module.exports = { upsertProfile, getMyProfile };
