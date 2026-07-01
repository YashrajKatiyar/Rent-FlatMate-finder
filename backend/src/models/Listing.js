const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true, trim: true },
    rent: { type: Number, required: true, min: 0 },
    availableFrom: { type: Date, required: true },
    roomType: {
      type: String,
      enum: ['single', 'shared', 'studio', '1bhk', '2bhk', 'other'],
      required: true,
    },
    furnishingStatus: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished'],
      required: true,
    },
    photos: [{ type: String }], // URLs / file paths
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'filled'], default: 'active' },
  },
  { timestamps: true }
);

listingSchema.index({ location: 1, rent: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);
