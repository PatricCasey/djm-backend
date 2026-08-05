const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: String,
    start: String,
    end: String
});

const ProfileSchema = new mongoose.Schema({
    name: String,
    birthday: Date,
    address: String,
    email: String,
    phone: String,
    linkedin: String, // optional — omitted from the resume when empty
    companies: [CompanySchema],
    education: {
        bachelor: {
            university: String,
            graduation: String
        },
        master: {
            university: String,
            graduation: String
        }
    },
    resumeStyle: { type: Number, default: 1 }
});

module.exports = mongoose.model('Profile', ProfileSchema);
