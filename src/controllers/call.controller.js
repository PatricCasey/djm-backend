const Call = require('../models/Call');
const User = require('../models/User');

async function listCalls(req, res) {
    try {
        const calls = await Call.find({ caller: req.userId })
            .populate('profile', 'name email')
            .sort({ date: -1, createdAt: -1 });
        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createCall(req, res) {
    try {
        const { profile, date, time, step, recordingLink, recruiterNameOrGmail, type, duration, status, caller } = req.body;
        const isAdmin = req.userRole === 'admin';

        if (profile && !isAdmin) {
            const user = await User.findById(req.userId, 'assignedProfiles');
            const isAssigned = (user.assignedProfiles || []).some(id => id.toString() === profile);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Profile not in your assigned profiles' });
            }
        }

        const call = new Call({
            caller: (isAdmin && caller) ? caller : req.userId,
            profile, date, time, step, recordingLink, recruiterNameOrGmail, type, duration, status
        });
        await call.save();

        const populated = await Call.findById(call._id)
            .populate('caller', 'email')
            .populate('profile', 'name email');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateCall(req, res) {
    try {
        const isAdmin = req.userRole === 'admin';
        const call = await Call.findById(req.params.callId);
        if (!call) return res.status(404).json({ error: 'Call not found' });
        if (!isAdmin && call.caller.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not your call record' });
        }

        if (req.body.profile && !isAdmin) {
            const user = await User.findById(req.userId, 'assignedProfiles');
            const isAssigned = (user.assignedProfiles || []).some(id => id.toString() === req.body.profile);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Profile not in your assigned profiles' });
            }
        }

        const allowedFields = ['profile', 'date', 'time', 'step', 'recordingLink', 'recruiterNameOrGmail', 'type', 'duration', 'status'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updated = await Call.findByIdAndUpdate(req.params.callId, updates, { new: true })
            .populate('caller', 'email')
            .populate('profile', 'name email');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteCall(req, res) {
    try {
        const isAdmin = req.userRole === 'admin';
        const call = await Call.findById(req.params.callId);
        if (!call) return res.status(404).json({ error: 'Call not found' });
        if (!isAdmin && call.caller.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not your call record' });
        }

        await Call.findByIdAndDelete(req.params.callId);
        res.json({ message: 'Call deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function listAllCalls(req, res) {
    try {
        const calls = await Call.find()
            .populate('caller', 'email')
            .populate('profile', 'name email')
            .sort({ date: -1, createdAt: -1 });
        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { listCalls, createCall, updateCall, deleteCall, listAllCalls };
