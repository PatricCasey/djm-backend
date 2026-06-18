const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const { generateResumeText } = require('../services/openai.service');
const { generatePDF } = require('../services/pdf');

async function generate(req, res) {
    const { profileId, jobUrl, jobDesc } = req.body;

    try {
        if (!profileId) {
            return res.status(400).json({ error: 'profileId is required' });
        }

        // Authorization: bidder → only their assignedProfile, caller → only their assignedProfiles, admin → any
        const currentUser = await User.findById(req.userId);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        if (req.userRole === 'bidder') {
            if (!currentUser.assignedProfile || currentUser.assignedProfile.toString() !== profileId) {
                return res.status(403).json({ error: 'Bidders can only generate resumes for their assigned profile' });
            }
        } else if (req.userRole === 'caller') {
            const isAssigned = (currentUser.assignedProfiles || []).some(id => id.toString() === profileId);
            if (!isAssigned) {
                return res.status(403).json({ error: 'You can only generate resumes for your assigned profiles' });
            }
        }
        // admin: no restriction

        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const resumeText = await generateResumeText(jobDesc, profile);
        const resumeStyle = profile.resumeStyle || 1;
        const pdfBuffer = await generatePDF(resumeText, profile, resumeStyle);

        // Save resume to DB (fire-and-forget)
        const resumeDoc = new Resume({ user: req.userId, profile: profileId, jobUrl, jobDesc, resumeText });
        resumeDoc.save().catch(err => console.error("Error saving resume:", err));

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${profile.name}-resume.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error("Error generating resume:", err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
}

async function search(req, res) {
    const { keyword, page = 1 } = req.query;

    try {
        let profileFilter;
        if (req.userRole === 'bidder') {
            const user = await User.findById(req.userId, 'assignedProfile');
            if (!user || !user.assignedProfile) {
                return res.json({ resumes: [], total: 0, page: 1, pages: 1 });
            }
            profileFilter = [user.assignedProfile];
        } else if (req.userRole === 'caller') {
            const user = await User.findById(req.userId, 'assignedProfiles');
            profileFilter = (user.assignedProfiles || []);
            if (profileFilter.length === 0) {
                return res.json({ resumes: [], total: 0, page: 1, pages: 1 });
            }
        }
        // admin: no filter (profileFilter stays undefined)

        const query = {};
        if (profileFilter) {
            query.profile = { $in: profileFilter };
        }
        if (keyword && keyword.trim()) {
            query.$or = [
                { jobUrl: { $regex: keyword, $options: 'i' } },
                { jobDesc: { $regex: keyword, $options: 'i' } },
                { resumeText: { $regex: keyword, $options: 'i' } }
            ];
        }

        const limit = 10;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (pageNum - 1) * limit;

        const [total, resumes] = await Promise.all([
            Resume.countDocuments(query),
            Resume.find(query)
                .populate('profile', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        const pages = Math.ceil(total / limit) || 1;
        res.json({ resumes, total, page: pageNum, pages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { generate, search };
