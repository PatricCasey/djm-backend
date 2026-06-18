const Payment = require('../models/Payment');

async function listPayments(req, res) {
    try {
        const payments = await Payment.find()
            .populate('paidTo', 'email role')
            .sort({ date: -1, createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createPayment(req, res) {
    try {
        const { date, paidTo, amount, note } = req.body;
        if (!date || !paidTo || amount == null) {
            return res.status(400).json({ error: 'date, paidTo, and amount are required' });
        }
        const payment = new Payment({ date, paidTo, amount, note });
        await payment.save();
        const populated = await Payment.findById(payment._id).populate('paidTo', 'email role');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updatePayment(req, res) {
    try {
        const { date, paidTo, amount, note } = req.body;
        const updates = {};
        if (date !== undefined) updates.date = date;
        if (paidTo !== undefined) updates.paidTo = paidTo;
        if (amount !== undefined) updates.amount = amount;
        if (note !== undefined) updates.note = note;

        const updated = await Payment.findByIdAndUpdate(req.params.paymentId, updates, { new: true })
            .populate('paidTo', 'email role');
        if (!updated) return res.status(404).json({ error: 'Payment not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deletePayment(req, res) {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.paymentId);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { listPayments, createPayment, updatePayment, deletePayment };
