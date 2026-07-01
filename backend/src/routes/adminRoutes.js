const express = require('express');
const {
  getUsers,
  deactivateUser,
  reactivateUser,
  getAllListings,
  deleteListing,
  getActivity,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/deactivate', deactivateUser);
router.patch('/users/:id/reactivate', reactivateUser);
router.get('/listings', getAllListings);
router.delete('/listings/:id', deleteListing);
router.get('/activity', getActivity);

module.exports = router;
