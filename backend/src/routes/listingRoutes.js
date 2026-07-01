const express = require('express');
const {
  createListing,
  getMyListings,
  markFilled,
  browseListings,
  getListingById,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, browseListings);
router.get('/mine', protect, authorize('owner'), getMyListings);
router.get('/:id', protect, getListingById);
router.post('/', protect, authorize('owner'), upload.array('photos', 6), createListing);
router.patch('/:id/fill', protect, authorize('owner'), markFilled);

module.exports = router;
