const mongoose = require('mongoose');

const interestRequestSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    compatibilityScore: { type: mongoose.Schema.Types.ObjectId, ref: 'CompatibilityScore' },
  },
  { timestamps: true }
);

interestRequestSchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('InterestRequest', interestRequestSchema);
