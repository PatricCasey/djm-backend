const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { getResumeCounts, getResumeCountsByProfile } = require('../controllers/analytics.controller');

router.get('/resume-counts', authMiddleware, requireRole('admin', 'bidder'), getResumeCounts);
router.get('/resume-counts-by-profile', authMiddleware, requireRole('admin'), getResumeCountsByProfile);

module.exports = router;
