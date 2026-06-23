const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    jobUrl: String,
    jobDesc: String,
    resumeText: String,
    education: [{
        degree: String,
        institution: String,
        graduation: String,
        coursework: [String],
        period: {
            start: Date,
            end: Date
        }
    }],
    experience: [{
        title: String,
        company: String,
        achievements: [String],
        period: {
            start: Date,
            end: Date
        }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
