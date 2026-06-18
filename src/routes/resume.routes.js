const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generate, search } = require('../controllers/resume.controller');

router.get('/search', authMiddleware, search);
router.post('/generate', authMiddleware, generate);

module.exports = router;
