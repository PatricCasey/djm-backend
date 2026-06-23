const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const { generateResumeText, generateApplicationAnswer } = require('../services/openai.service');
const { generatePDF } = require('../services/pdf');

async function assertProfileAccess(req, profileId) {
    if (!profileId) {
        const err = new Error('profileId is required');
        err.status = 400;
        throw err;
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }

    if (req.userRole === 'bidder') {
        if (!currentUser.assignedProfile || currentUser.assignedProfile.toString() !== profileId) {
            const err = new Error('Bidders can only use their assigned profile');
            err.status = 403;
            throw err;
        }
    } else if (req.userRole === 'caller') {
        const isAssigned = (currentUser.assignedProfiles || []).some(id => id.toString() === profileId);
        if (!isAssigned) {
            const err = new Error('You can only use your assigned profiles');
            err.status = 403;
            throw err;
        }
    }

    return currentUser;
}

async function generate(req, res) {
    const { profileId, jobUrl, jobDesc } = req.body;

    try {
        await assertProfileAccess(req, profileId);

        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const resumeText = await generateResumeText(jobDesc, profile);
        const resumeStyle = profile.resumeStyle || 1;
        const pdfBuffer = await generatePDF(resumeText, profile, resumeStyle);

        const resumeDoc = new Resume({ user: req.userId, profile: profileId, jobUrl, jobDesc, resumeText });
        await resumeDoc.save();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${profile.name}-resume.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error("Error generating resume:", err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
}

async function answerQuestion(req, res) {
    const { profileId, jobUrl, jobDesc, question } = req.body;

    try {
        if (!question || !question.trim()) {
            return res.status(400).json({ error: 'question is required' });
        }

        await assertProfileAccess(req, profileId);

        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const resumeQuery = { profile: profileId };
        if (req.userRole !== 'admin') resumeQuery.user = req.userId;
        if (jobUrl) resumeQuery.jobUrl = jobUrl;
        if (jobDesc) resumeQuery.jobDesc = jobDesc;

        let resumeDoc = await Resume.findOne(resumeQuery).sort({ createdAt: -1 });
        if (!resumeDoc && jobDesc) {
            const fallbackQuery = { profile: profileId, jobDesc };
            if (req.userRole !== 'admin') fallbackQuery.user = req.userId;
            resumeDoc = await Resume.findOne(fallbackQuery).sort({ createdAt: -1 });
        }

        if (!resumeDoc) {
            return res.status(400).json({ error: 'Generate a resume for this job before generating answers' });
        }

        const answer = await generateApplicationAnswer({
            question: question.trim(),
            jobDesc: jobDesc || resumeDoc.jobDesc,
            resumeText: resumeDoc.resumeText,
            profile
        });

        res.json({ answer });
    } catch (err) {
        console.error("Error generating application answer:", err);
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

module.exports = { generate, answerQuestion, search };
