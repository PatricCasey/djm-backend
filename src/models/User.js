const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: { type: String, enum: ['caller', 'bidder', 'admin'], default: 'bidder' },
    approved: { type: Boolean, default: false },
    assignedProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    assignedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }]
});

module.exports = mongoose.model('User', UserSchema);
