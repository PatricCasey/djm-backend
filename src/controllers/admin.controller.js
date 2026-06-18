const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');

// ---- User endpoints ----

async function listUsers(req, res) {
    try {
        const users = await User.find({}, '-password')
            .populate('assignedProfile', 'name email')
            .populate('assignedProfiles', 'name email');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findById(req.params.userId, '-password')
            .populate('assignedProfile', 'name email')
            .populate('assignedProfiles', 'name email');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { email },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function changeRole(req, res) {
    try {
        const { role } = req.body;
        if (!['caller', 'bidder'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Clear profile assignments when changing roles
        if (user.role === 'bidder' && role !== 'bidder') {
            user.assignedProfile = null;
        }
        if (user.role === 'caller' && role !== 'caller') {
            user.assignedProfiles = [];
        }

        user.role = role;
        await user.save();

        const updated = await User.findById(user._id, '-password')
            .populate('assignedProfile', 'name email')
            .populate('assignedProfiles', 'name email');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ---- Profile endpoints ----

async function listProfiles(req, res) {
    try {
        const profiles = await Profile.find({});
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createProfile(req, res) {
    try {
        const { name, birthday, address, email, phone, companies, education, resumeStyle } = req.body;
        const profile = new Profile({ name, birthday, address, email, phone, companies, education, resumeStyle });
        await profile.save();
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateProfile(req, res) {
    try {
        const { name, birthday, address, email, phone, companies, education, resumeStyle } = req.body;
        const profile = await Profile.findByIdAndUpdate(
            req.params.profileId,
            { name, birthday, address, email, phone, companies, education, resumeStyle },
            { new: true, runValidators: true }
        );
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteProfile(req, res) {
    try {
        const profileId = req.params.profileId;

        // Unassign from any users first
        await User.updateMany(
            { assignedProfile: profileId },
            { $unset: { assignedProfile: '' } }
        );
        await User.updateMany(
            { assignedProfiles: profileId },
            { $pull: { assignedProfiles: profileId } }
        );

        const profile = await Profile.findByIdAndDelete(profileId);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function assignProfile(req, res) {
    try {
        const { profileId } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.role !== 'bidder') return res.status(400).json({ error: 'User is not a bidder' });

        if (profileId) {
            const profile = await Profile.findById(profileId);
            if (!profile) return res.status(404).json({ error: 'Profile not found' });
        }

        user.assignedProfile = profileId || null;
        await user.save();

        const updated = await User.findById(user._id, '-password')
            .populate('assignedProfile', 'name email');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function assignProfiles(req, res) {
    try {
        const { profileIds } = req.body;
        const user = await User.findById(req.params.callerId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.role !== 'caller') return res.status(400).json({ error: 'User is not a caller' });

        if (profileIds && profileIds.length > 0) {
            const profiles = await Profile.find({ _id: { $in: profileIds } });
            if (profiles.length !== profileIds.length) {
                return res.status(400).json({ error: 'Some profile IDs are invalid' });
            }
        }

        user.assignedProfiles = profileIds || [];
        await user.save();

        const updated = await User.findById(user._id, '-password')
            .populate('assignedProfiles', 'name email');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function toggleApproval(req, res) {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.approved = !user.approved;
        await user.save();
        const updated = await User.findById(user._id, '-password')
            .populate('assignedProfile', 'name email')
            .populate('assignedProfiles', 'name email');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getDuplicateJobUrls(req, res) {
    try {
        const threshold = parseInt(req.query.threshold, 10) || 3;
        const profileId = req.query.profileId || null;

        const matchStage = { jobUrl: { $ne: null, $ne: '' }, profile: { $ne: null } };
        if (profileId) {
            const mongoose = require('mongoose');
            matchStage.profile = new mongoose.Types.ObjectId(profileId);
        }

        const duplicates = await Resume.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { jobUrl: '$jobUrl', profile: '$profile' },
                    count: { $sum: 1 },
                    users: { $addToSet: '$user' },
                    lastUsed: { $max: '$createdAt' },
                    firstUsed: { $min: '$createdAt' },
                }
            },
            { $match: { count: { $gt: threshold } } },
            { $sort: { count: -1 } }
        ]);

        const profileIds = [...new Set(duplicates.map(d => d._id.profile).filter(Boolean).map(String))];
        const userIds = [...new Set(duplicates.flatMap(d => d.users.filter(Boolean).map(String)))];

        const [profileDocs, userDocs] = await Promise.all([
            Profile.find({ _id: { $in: profileIds } }, 'name email'),
            User.find({ _id: { $in: userIds } }, 'email role'),
        ]);

        const profileMap = {};
        profileDocs.forEach(p => { profileMap[p._id.toString()] = p; });
        const userMap = {};
        userDocs.forEach(u => { userMap[u._id.toString()] = u; });

        const result = duplicates.map(d => ({
            jobUrl: d._id.jobUrl,
            profile: profileMap[d._id.profile?.toString()] || { _id: d._id.profile, name: 'Unknown' },
            count: d.count,
            users: d.users.filter(Boolean).map(id => userMap[id.toString()] || { _id: id, email: 'Unknown' }),
            lastUsed: d.lastUsed,
            firstUsed: d.firstUsed,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    listUsers, getUser, updateUser, changeRole,
    listProfiles, createProfile, updateProfile, deleteProfile,
    assignProfile, assignProfiles, toggleApproval,
    getDuplicateJobUrls
};
