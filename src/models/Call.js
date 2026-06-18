const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    date: Date,
    time: String,
    step: { type: String, enum: ['pre-screening', 'screening', 'technical', 'final'] },
    recordingLink: String,
    recruiterNameOrGmail: String,
    type: { type: String, enum: ['phone', 'video'] },
    duration: Number,
    status: { type: String, enum: ['completed', 'not-completed', 'rescheduled'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Call', CallSchema);
