const asyncHandler = require('express-async-handler');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');

async function assertParticipant(interestId, userId) {
  const interest = await InterestRequest.findById(interestId);
  if (!interest) throw new ApiError(404, 'Interest request not found');
  if (interest.status !== 'accepted') {
    throw new ApiError(403, 'Chat is only available once the interest request has been accepted');
  }
  const isParticipant = String(interest.tenant) === String(userId) || String(interest.owner) === String(userId);
  if (!isParticipant) throw new ApiError(403, 'You are not part of this conversation');
  return interest;
}

// @route GET /api/chat/:interestId/messages
const getMessages = asyncHandler(async (req, res) => {
  await assertParticipant(req.params.interestId, req.user._id);
  const messages = await Message.find({ interestRequest: req.params.interestId })
    .populate('sender', 'name role')
    .sort({ createdAt: 1 });
  res.json({ success: true, data: messages });
});

// @route GET /api/chat/threads  (list accepted interest requests as chat threads for current user)
const getThreads = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'tenant'
      ? { tenant: req.user._id, status: 'accepted' }
      : { owner: req.user._id, status: 'accepted' };

  const threads = await InterestRequest.find(filter)
    .populate('listing')
    .populate('tenant', 'name email')
    .populate('owner', 'name email')
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: threads });
});

module.exports = { getMessages, getThreads, assertParticipant };
