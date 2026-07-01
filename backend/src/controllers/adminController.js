const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');

// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// @route PATCH /api/admin/users/:id/deactivate
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = false;
  await user.save();
  res.json({ success: true, data: user });
});

// @route PATCH /api/admin/users/:id/reactivate
const reactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = true;
  await user.save();
  res.json({ success: true, data: user });
});

// @route GET /api/admin/listings
const getAllListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find().populate('owner', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, data: listings });
});

// @route DELETE /api/admin/listings/:id
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  await listing.deleteOne();
  res.json({ success: true, message: 'Listing removed' });
});

// @route GET /api/admin/activity  (platform-wide activity summary)
const getActivity = asyncHandler(async (req, res) => {
  const [userCount, tenantCount, ownerCount, listingCount, activeListingCount, interestCount, acceptedInterestCount, messageCount] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tenant' }),
      User.countDocuments({ role: 'owner' }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      InterestRequest.countDocuments(),
      InterestRequest.countDocuments({ status: 'accepted' }),
      Message.countDocuments(),
    ]);

  res.json({
    success: true,
    data: {
      userCount,
      tenantCount,
      ownerCount,
      listingCount,
      activeListingCount,
      filledListingCount: listingCount - activeListingCount,
      interestCount,
      acceptedInterestCount,
      messageCount,
    },
  });
});

module.exports = { getUsers, deactivateUser, reactivateUser, getAllListings, deleteListing, getActivity };
