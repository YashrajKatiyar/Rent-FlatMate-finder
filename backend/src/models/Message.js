const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    interestRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'InterestRequest', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ interestRequest: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
