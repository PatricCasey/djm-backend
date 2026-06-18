const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    paidTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
