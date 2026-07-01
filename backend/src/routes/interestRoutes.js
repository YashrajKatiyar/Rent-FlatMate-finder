const express = require('express');
const {
  sendInterest,
  respondToInterest,
  getSentInterests,
  getReceivedInterests,
} = require('../controllers/interestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('tenant'), sendInterest);
router.patch('/:id', protect, authorize('owner'), respondToInterest);
router.get('/sent', protect, authorize('tenant'), getSentInterests);
router.get('/received', protect, authorize('owner'), getReceivedInterests);

module.exports = router;
