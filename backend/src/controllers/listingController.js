const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const TenantProfile = require('../models/TenantProfile');
const CompatibilityScore = require('../models/CompatibilityScore');
const ApiError = require('../utils/ApiError');
const { computeCompatibilityScore } = require('../services/llmService');

// @route POST /api/listings  (owner only)
const createListing = asyncHandler(async (req, res) => {
  const { location, rent, availableFrom, roomType, furnishingStatus, description } = req.body;
  if (!location || !rent || !availableFrom || !roomType || !furnishingStatus) {
    throw new ApiError(400, 'location, rent, availableFrom, roomType, and furnishingStatus are required');
  }

  const photos = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const listing = await Listing.create({
    owner: req.user._id,
    location,
    rent,
    availableFrom,
    roomType,
    furnishingStatus,
    description,
    photos,
  });

  res.status(201).json({ success: true, data: listing });
});

// @route GET /api/listings/mine  (owner only)
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: listings });
});

// @route PATCH /api/listings/:id/fill  (owner only, must own listing)
const markFilled = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not own this listing');
  }
  listing.status = 'filled';
  await listing.save();
  res.json({ success: true, data: listing });
});

// @route GET /api/listings  (tenant browse/filter, ranked by compatibility)
// Query params: location, minRent, maxRent
const browseListings = asyncHandler(async (req, res) => {
  const { location, minRent, maxRent } = req.query;

  const filter = { status: 'active' };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
  }

  const listings = await Listing.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });

  // If the requester is a tenant with a profile, compute/fetch compatibility scores and rank.
  let tenantProfile = null;
  if (req.user && req.user.role === 'tenant') {
    tenantProfile = await TenantProfile.findOne({ user: req.user._id });
  }

  if (!tenantProfile) {
    // No profile yet (or non-tenant browsing) -> return unranked
    return res.json({ success: true, data: listings.map((l) => ({ listing: l, compatibility: null })) });
  }

  const results = await Promise.all(
    listings.map(async (listing) => {
      let scoreDoc = await CompatibilityScore.findOne({ tenant: req.user._id, listing: listing._id });

      if (!scoreDoc) {
        // Not computed yet (or invalidated after profile edit) -> compute now, store for reuse.
        const { score, explanation, source } = await computeCompatibilityScore(tenantProfile, listing);
        scoreDoc = await CompatibilityScore.findOneAndUpdate(
          { tenant: req.user._id, listing: listing._id },
          { tenant: req.user._id, listing: listing._id, score, explanation, source },
          { upsert: true, new: true }
        );
      }

      return { listing, compatibility: scoreDoc };
    })
  );

  results.sort((a, b) => b.compatibility.score - a.compatibility.score);

  res.json({ success: true, data: results });
});

// @route GET /api/listings/:id
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('owner', 'name email');
  if (!listing) throw new ApiError(404, 'Listing not found');
  res.json({ success: true, data: listing });
});

module.exports = { createListing, getMyListings, markFilled, browseListings, getListingById };
