const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
    listUsers, getUser, updateUser, changeRole,
    listProfiles, createProfile, updateProfile, deleteProfile,
    assignProfile, assignProfiles, toggleApproval,
    getDuplicateJobUrls
} = require('../controllers/admin.controller');

router.use(authMiddleware, requireRole('admin'));

// User routes
router.get('/users', listUsers);
router.get('/users/:userId', getUser);
router.put('/users/:userId', updateUser);
router.put('/users/:userId/role', changeRole);
router.put('/users/:userId/assign-profile', assignProfile);
router.put('/users/:callerId/assign-profiles', assignProfiles);
router.put('/users/:userId/toggle-approval', toggleApproval);

// Checking
router.get('/duplicate-urls', getDuplicateJobUrls);

// Profile routes
router.get('/profiles', listProfiles);
router.post('/profiles', createProfile);
router.put('/profiles/:profileId', updateProfile);
router.delete('/profiles/:profileId', deleteProfile);

module.exports = router;
