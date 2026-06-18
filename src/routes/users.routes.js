const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const User = require('../models/User');

router.get('/my-profiles', authMiddleware, requireRole('caller', 'bidder', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('assignedProfile')
            .populate('assignedProfiles');
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role === 'caller') {
            res.json(user.assignedProfiles || []);
        } else if (user.role === 'bidder') {
            res.json(user.assignedProfile ? [user.assignedProfile] : []);
        } else {
            // Admin: return empty, they select from all profiles via admin API
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
