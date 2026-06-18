const Income = require('../models/Income');
const IncomeSummary = require('../models/IncomeSummary');

async function listIncomes(req, res) {
    try {
        const incomes = await Income.find().sort({ date: -1, createdAt: -1 });
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createIncome(req, res) {
    try {
        const { date, amount, note } = req.body;
        if (!date || amount == null) {
            return res.status(400).json({ error: 'date and amount are required' });
        }
        const income = new Income({ date, amount, note });
        await income.save();
        res.status(201).json(income);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateIncome(req, res) {
    try {
        const { date, amount, note } = req.body;
        const updates = {};
        if (date !== undefined) updates.date = date;
        if (amount !== undefined) updates.amount = amount;
        if (note !== undefined) updates.note = note;

        const updated = await Income.findByIdAndUpdate(req.params.incomeId, updates, { new: true });
        if (!updated) return res.status(404).json({ error: 'Income not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteIncome(req, res) {
    try {
        const income = await Income.findByIdAndDelete(req.params.incomeId);
        if (!income) return res.status(404).json({ error: 'Income not found' });
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getMonthlySummary(req, res) {
    try {
        const [aggregated, summaries] = await Promise.all([
            Income.aggregate([
                {
                    $group: {
                        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } }
            ]),
            IncomeSummary.find().sort({ year: -1, month: -1 })
        ]);

        // Merge aggregated income totals with real/bonus from IncomeSummary
        const summaryMap = {};
        for (const s of summaries) {
            summaryMap[`${s.year}-${s.month}`] = { real: s.real, bonus: s.bonus, _id: s._id };
        }

        const result = aggregated.map(a => {
            const key = `${a._id.year}-${a._id.month}`;
            const s = summaryMap[key] || { real: 0, bonus: 0 };
            return {
                _id: a._id,
                totalAmount: a.totalAmount,
                count: a.count,
                real: s.real,
                bonus: s.bonus,
                summaryId: s._id || null
            };
        });

        // Also include summary months that have no income records
        for (const s of summaries) {
            const key = `${s.year}-${s.month}`;
            if (!aggregated.find(a => `${a._id.year}-${a._id.month}` === key)) {
                result.push({
                    _id: { year: s.year, month: s.month },
                    totalAmount: 0,
                    count: 0,
                    real: s.real,
                    bonus: s.bonus,
                    summaryId: s._id
                });
            }
        }

        result.sort((a, b) => b._id.year - a._id.year || b._id.month - a._id.month);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function upsertMonthlySummary(req, res) {
    try {
        const { year, month, real, bonus } = req.body;
        if (!year || !month) {
            return res.status(400).json({ error: 'year and month are required' });
        }
        const summary = await IncomeSummary.findOneAndUpdate(
            { year, month },
            { real: real || 0, bonus: bonus || 0 },
            { upsert: true, new: true }
        );
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { listIncomes, createIncome, updateIncome, deleteIncome, getMonthlySummary, upsertMonthlySummary };
