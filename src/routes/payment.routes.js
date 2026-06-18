const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { listPayments, createPayment, updatePayment, deletePayment } = require('../controllers/payment.controller');

router.get('/', authMiddleware, requireRole('admin'), listPayments);
router.post('/', authMiddleware, requireRole('admin'), createPayment);
router.put('/:paymentId', authMiddleware, requireRole('admin'), updatePayment);
router.delete('/:paymentId', authMiddleware, requireRole('admin'), deletePayment);

module.exports = router;
