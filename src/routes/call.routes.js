const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { listCalls, createCall, updateCall, deleteCall, listAllCalls } = require('../controllers/call.controller');

router.get('/', authMiddleware, requireRole('caller'), listCalls);
router.post('/', authMiddleware, requireRole('caller', 'admin'), createCall);
router.put('/:callId', authMiddleware, requireRole('caller', 'admin'), updateCall);
router.delete('/:callId', authMiddleware, requireRole('caller', 'admin'), deleteCall);
router.get('/all', authMiddleware, requireRole('admin'), listAllCalls);

module.exports = router;
