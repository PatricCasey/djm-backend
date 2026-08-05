const Call = require('../models/Call');
const User = require('../models/User');
const mongoose = require('mongoose');

const POPULATE = (q) => q.populate('caller', 'email role callColor').populate('profile', 'name email');

// Callers see the calls assigned to them plus the unassigned pool, which any
// caller may claim for themselves.
async function listCalls(req, res) {
    try {
        const mine = mongoose.Types.ObjectId.isValid(req.userId) ? [{ caller: req.userId }] : [];
        const calls = await POPULATE(
            Call.find({ $or: [...mine, { caller: null }] })
        ).sort({ date: -1, createdAt: -1 });
        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createCall(req, res) {
    try {
        const {
            profile, date, time, step, recordingLink, meetingLink,
            recruiterNameOrGmail, companyName, jobDescription, resume,
            type, duration, status, note, caller
        } = req.body;
        const isAdmin = req.userRole === 'admin';

        if (profile && !isAdmin) {
            const user = await User.findById(req.userId, 'assignedProfiles');
            const isAssigned = (user.assignedProfiles || []).some(id => id.toString() === profile);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Profile not in your assigned profiles' });
            }
        }

        // An admin may deliberately leave the caller empty — the call then lands
        // in the unassigned pool for a caller to pick up.
        const resolvedCaller = isAdmin
            ? (caller || null)
            : (mongoose.Types.ObjectId.isValid(req.userId) ? req.userId : null);

        const call = new Call({
            caller: resolvedCaller,
            profile, date, time, step, recordingLink, meetingLink,
            recruiterNameOrGmail, companyName, jobDescription, resume,
            type, duration, status, note
        });
        await call.save();

        const populated = await POPULATE(Call.findById(call._id));
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

        const currentCaller = call.caller ? call.caller.toString() : null;
        const isUnassigned = currentCaller === null;
        if (!isAdmin && !isUnassigned && currentCaller !== req.userId) {
            return res.status(403).json({ error: 'Not your call record' });
        }

        const currentProfile = call.profile ? call.profile.toString() : null;
        if (req.body.profile && !isAdmin && req.body.profile !== currentProfile) {
            const user = await User.findById(req.userId, 'assignedProfiles');
            const isAssigned = (user.assignedProfiles || []).some(id => id.toString() === req.body.profile);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Profile not in your assigned profiles' });
            }
        }

        const allowedFields = [
            'profile', 'date', 'time', 'step', 'recordingLink', 'meetingLink',
            'recruiterNameOrGmail', 'companyName', 'jobDescription', 'resume',
            'type', 'duration', 'status', 'note'
        ];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (isAdmin) {
            // `null` here is meaningful: it returns the call to the unassigned pool.
            if (req.body.caller !== undefined) updates.caller = req.body.caller || null;
        } else if (isUnassigned) {
            // A caller editing an unassigned call takes ownership of it.
            updates.caller = req.userId;
        }

        const updated = await POPULATE(
            Call.findByIdAndUpdate(req.params.callId, updates, { new: true })
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Self-service assignment: a caller takes an unassigned call for themselves.
async function claimCall(req, res) {
    try {
        const call = await Call.findById(req.params.callId);
        if (!call) return res.status(404).json({ error: 'Call not found' });

        const currentCaller = call.caller ? call.caller.toString() : null;
        if (currentCaller && currentCaller !== req.userId) {
            return res.status(409).json({ error: 'Call is already assigned to another caller' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
            return res.status(400).json({ error: 'Invalid user' });
        }

        call.caller = req.userId;
        await call.save();

        const populated = await POPULATE(Call.findById(call._id));
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// A caller can hand a call back to the unassigned pool; an admin can release any call.
async function releaseCall(req, res) {
    try {
        const isAdmin = req.userRole === 'admin';
        const call = await Call.findById(req.params.callId);
        if (!call) return res.status(404).json({ error: 'Call not found' });

        const currentCaller = call.caller ? call.caller.toString() : null;
        if (!isAdmin && currentCaller !== req.userId) {
            return res.status(403).json({ error: 'Not your call record' });
        }

        call.caller = null;
        await call.save();

        const populated = await POPULATE(Call.findById(call._id));
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteCall(req, res) {
    try {
        const isAdmin = req.userRole === 'admin';
        const call = await Call.findById(req.params.callId);
        if (!call) return res.status(404).json({ error: 'Call not found' });

        const currentCaller = call.caller ? call.caller.toString() : null;
        if (!isAdmin && currentCaller !== req.userId) {
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
        const calls = await POPULATE(Call.find()).sort({ date: -1, createdAt: -1 });
        res.json(calls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { listCalls, createCall, updateCall, deleteCall, listAllCalls, claimCall, releaseCall };
