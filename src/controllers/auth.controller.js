const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config');

async function register(req, res) {
    const { email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role: 'bidder', approved: false });
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        // Check admin credentials from env
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = jwt.sign({ userId: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, user: { id: 'admin', email: ADMIN_EMAIL, role: 'admin' } });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });
        if (!user.approved) return res.status(403).json({ error: 'Account pending approval. Please contact admin.' });
        const role = user.role || 'bidder';
        const token = jwt.sign({ userId: user._id, role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email: user.email, role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { register, login };
