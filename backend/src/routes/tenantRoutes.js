const express = require('express');
const { upsertProfile, getMyProfile } = require('../controllers/tenantController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/profile', protect, authorize('tenant'), upsertProfile);
router.get('/profile', protect, authorize('tenant'), getMyProfile);

module.exports = router;
