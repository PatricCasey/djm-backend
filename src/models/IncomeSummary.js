const mongoose = require('mongoose');

const IncomeSummarySchema = new mongoose.Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    real: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
}, { timestamps: true });

IncomeSummarySchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('IncomeSummary', IncomeSummarySchema);
