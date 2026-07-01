const mongoose = require('mongoose');

const tenantProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferredLocation: { type: String, required: true, trim: true },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    moveInDate: { type: Date, required: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

tenantProfileSchema.pre('validate', function validateBudget(next) {
  if (this.budgetMin > this.budgetMax) {
    return next(new Error('budgetMin cannot be greater than budgetMax'));
  }
  next();
});

module.exports = mongoose.model('TenantProfile', tenantProfileSchema);
