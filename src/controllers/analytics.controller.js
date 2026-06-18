const User = require('../models/User');
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

async function getResumeCounts(req, res) {
    try {
        const { granularity = 'daily', startDate, endDate, profileId } = req.query;
        const pipeline = [];

        // Bidder sees only data for their assigned profile, admin sees all (or filtered by profileId)
        if (req.userRole === 'bidder') {
            const user = await User.findById(req.userId, 'assignedProfile');
            if (!user || !user.assignedProfile) {
                return res.json([]);
            }
            pipeline.push({
                $match: { profile: new mongoose.Types.ObjectId(user.assignedProfile) }
            });
        } else if (profileId) {
            pipeline.push({
                $match: { profile: new mongoose.Types.ObjectId(profileId) }
            });
        }

        // Date range filter
        const dateMatch = {};
        if (startDate) dateMatch.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateMatch.$lte = end;
        }
        if (Object.keys(dateMatch).length > 0) {
            pipeline.push({ $match: { createdAt: dateMatch } });
        }

        if (granularity === 'total') {
            pipeline.push({ $group: { _id: null, count: { $sum: 1 } } });
            const counts = await Resume.aggregate(pipeline);
            return res.json(counts.length > 0 ? [{ date: 'Total', count: counts[0].count }] : [{ date: 'Total', count: 0 }]);
        }

        let dateFormat;
        if (granularity === 'weekly') {
            dateFormat = "%G-W%V";
        } else if (granularity === 'monthly') {
            dateFormat = "%Y-%m";
        } else {
            dateFormat = "%Y-%m-%d";
        }

        pipeline.push(
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        );

        const counts = await Resume.aggregate(pipeline);
        res.json(counts.map(row => ({ date: row._id, count: row.count })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getResumeCountsByProfile(req, res) {
    try {
        const { granularity = 'daily', startDate, endDate } = req.query;
        const Profile = require('../models/Profile');
        const profiles = await Profile.find({}, 'name email phone address');

        // Build date filter
        const dateMatch = {};
        if (startDate) dateMatch.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateMatch.$lte = end;
        }

        let dateFormat;
        if (granularity === 'weekly') {
            dateFormat = "%G-W%V";
        } else {
            dateFormat = "%Y-%m-%d";
        }

        const results = [];
        for (const profile of profiles) {
            const pipeline = [{ $match: { profile: profile._id } }];

            if (Object.keys(dateMatch).length > 0) {
                pipeline.push({ $match: { createdAt: dateMatch } });
            }

            // Get counts grouped by date
            const countsPipeline = [...pipeline,
                { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ];

            // Get latest resume date
            const latestPipeline = [...pipeline,
                { $sort: { createdAt: -1 } },
                { $limit: 1 },
                { $project: { createdAt: 1 } }
            ];

            // Get today's count
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayPipeline = [
                { $match: { profile: profile._id, createdAt: { $gte: todayStart } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ];

            const [counts, latest, todayCounts] = await Promise.all([
                Resume.aggregate(countsPipeline),
                Resume.aggregate(latestPipeline),
                Resume.aggregate(todayPipeline)
            ]);

            const total = counts.reduce((sum, row) => sum + row.count, 0);
            results.push({
                profile: { _id: profile._id, name: profile.name, email: profile.email, phone: profile.phone, address: profile.address },
                total,
                today: todayCounts.length > 0 ? todayCounts[0].count : 0,
                lastActivity: latest.length > 0 ? latest[0].createdAt : null,
                counts: counts.map(row => ({ date: row._id, count: row.count }))
            });
        }

        // Sort by total descending
        results.sort((a, b) => b.total - a.total);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getResumeCounts, getResumeCountsByProfile };
