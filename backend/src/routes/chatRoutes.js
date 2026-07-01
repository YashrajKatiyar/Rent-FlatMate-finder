const express = require('express');
const { getMessages, getThreads } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/threads', protect, getThreads);
router.get('/:interestId/messages', protect, getMessages);

module.exports = router;
