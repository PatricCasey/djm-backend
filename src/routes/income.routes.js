const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { listIncomes, createIncome, updateIncome, deleteIncome, getMonthlySummary, upsertMonthlySummary } = require('../controllers/income.controller');

router.get('/monthly-summary', authMiddleware, requireRole('admin'), getMonthlySummary);
router.put('/monthly-summary', authMiddleware, requireRole('admin'), upsertMonthlySummary);
router.get('/', authMiddleware, requireRole('admin'), listIncomes);
router.post('/', authMiddleware, requireRole('admin'), createIncome);
router.put('/:incomeId', authMiddleware, requireRole('admin'), updateIncome);
router.delete('/:incomeId', authMiddleware, requireRole('admin'), deleteIncome);

module.exports = router;
