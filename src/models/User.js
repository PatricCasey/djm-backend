const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: { type: String, enum: ['caller', 'bidder', 'admin'], default: 'bidder' },
    approved: { type: Boolean, default: false },
    // Colour this caller's meetings get on the call calendar. Unset means the
    // frontend falls back to a palette colour picked from the caller's position.
    callColor: { type: String, default: null },
    assignedProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    assignedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }]
});

module.exports = mongoose.model('User', UserSchema);
