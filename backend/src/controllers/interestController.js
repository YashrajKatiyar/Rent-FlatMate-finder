const asyncHandler = require('express-async-handler');
const InterestRequest = require('../models/InterestRequest');
const Listing = require('../models/Listing');
const CompatibilityScore = require('../models/CompatibilityScore');
const ApiError = require('../utils/ApiError');
const { notifyOwnerHighMatch, notifyTenantInterestUpdate } = require('../services/emailService');

const HIGH_MATCH_THRESHOLD = Number(process.env.HIGH_MATCH_THRESHOLD || 80);

// @route POST /api/interests  (tenant only) { listingId }
const sendInterest = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) throw new ApiError(400, 'listingId is required');

  const listing = await Listing.findById(listingId).populate('owner', 'name email');
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (listing.status === 'filled') throw new ApiError(400, 'This listing has already been filled');

  const existing = await InterestRequest.findOne({ tenant: req.user._id, listing: listingId });
  if (existing) throw new ApiError(409, 'You have already expressed interest in this listing');

  const scoreDoc = await CompatibilityScore.findOne({ tenant: req.user._id, listing: listingId });

  const interest = await InterestRequest.create({
    tenant: req.user._id,
    listing: listingId,
    owner: listing.owner._id,
    compatibilityScore: scoreDoc ? scoreDoc._id : undefined,
  });

  if (scoreDoc && scoreDoc.score >= HIGH_MATCH_THRESHOLD) {
    await notifyOwnerHighMatch({
      ownerEmail: listing.owner.email,
      tenantName: req.user.name,
      listingLocation: listing.location,
      score: scoreDoc.score,
    });
  }

  res.status(201).json({ success: true, data: interest });
});

// @route PATCH /api/interests/:id  (owner only) { decision: 'accepted' | 'declined' }
const respondToInterest = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  if (!['accepted', 'declined'].includes(decision)) {
    throw new ApiError(400, "decision must be 'accepted' or 'declined'");
  }

  const interest = await InterestRequest.findById(req.params.id)
    .populate('tenant', 'name email')
    .populate('listing', 'location');

  if (!interest) throw new ApiError(404, 'Interest request not found');
  if (String(interest.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not the owner of this listing');
  }
  if (interest.status !== 'pending') {
    throw new ApiError(400, `This request has already been ${interest.status}`);
  }

  interest.status = decision;
  await interest.save();

  await notifyTenantInterestUpdate({
    tenantEmail: interest.tenant.email,
    listingLocation: interest.listing.location,
    decision,
  });

  res.json({ success: true, data: interest });
});

// @route GET /api/interests/sent  (tenant only)
const getSentInterests = asyncHandler(async (req, res) => {
  const interests = await InterestRequest.find({ tenant: req.user._id })
    .populate('listing')
    .populate('compatibilityScore')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: interests });
});

// @route GET /api/interests/received  (owner only)
const getReceivedInterests = asyncHandler(async (req, res) => {
  const interests = await InterestRequest.find({ owner: req.user._id })
    .populate('listing')
    .populate('tenant', 'name email')
    .populate('compatibilityScore')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: interests });
});

module.exports = { sendInterest, respondToInterest, getSentInterests, getReceivedInterests };
