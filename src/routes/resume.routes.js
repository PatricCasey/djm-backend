const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generate, answerQuestion, search } = require('../controllers/resume.controller');

router.get('/search', authMiddleware, search);
router.post('/generate', authMiddleware, generate);
router.post('/answer-question', authMiddleware, answerQuestion);

module.exports = router;
