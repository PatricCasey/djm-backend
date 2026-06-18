function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}

module.exports = requireRole;
