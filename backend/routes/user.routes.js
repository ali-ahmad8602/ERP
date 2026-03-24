const router = require('express').Router();
const User = require('../models/User');
const { protect, isOrgAdmin } = require('../middleware/auth');

router.use(protect);

// GET /api/users?search=query — search users by name or email
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    // Search mode — available to all authenticated users
    if (search && search.trim().length >= 2) {
      const regex = new RegExp(search.trim(), 'i');
      const users = await User.find({
        isActive: true,
        $or: [{ name: regex }, { email: regex }]
      })
        .select('name email avatar orgRole departments')
        .populate('departments.department', 'name slug icon color')
        .limit(20);
      return res.json({ users });
    }

    // List mode — admin only
    const { orgRole } = req.user;
    if (!['super_admin', 'org_admin'].includes(orgRole)) {
      return res.status(403).json({ message: 'Admin access required to list all users' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find()
        .select('name email avatar orgRole departments isActive lastLogin createdAt')
        .populate('departments.department', 'name slug icon color')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments()
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:userId — get single user
router.get('/:userId', async (req, res) => {
  try {
    const { orgRole } = req.user;
    const isSelf = req.user._id.toString() === req.params.userId;

    if (!isSelf && !['super_admin', 'org_admin'].includes(orgRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('departments.department', 'name slug icon color')
      .populate('boardPermissions.board', 'name department');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:userId — update user
router.patch('/:userId', async (req, res) => {
  try {
    const { orgRole } = req.user;
    const isSelf = req.user._id.toString() === req.params.userId;
    const isAdmin = ['super_admin', 'org_admin'].includes(orgRole);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};

    // Self can update name and avatar
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

    // Only admins can change orgRole
    if (req.body.orgRole !== undefined) {
      if (!isAdmin) return res.status(403).json({ message: 'Only admins can change org roles' });
      // Prevent non-super_admin from assigning super_admin
      if (req.body.orgRole === 'super_admin' && orgRole !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admins can assign super admin role' });
      }
      updates.orgRole = req.body.orgRole;
    }

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true })
      .select('-password')
      .populate('departments.department', 'name slug icon color');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:userId/deactivate — soft deactivate
router.patch('/:userId/deactivate', isOrgAdmin, async (req, res) => {
  try {
    // Prevent deactivating yourself
    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).json({ message: 'You cannot deactivate yourself' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:userId/activate — reactivate
router.patch('/:userId/activate', isOrgAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user, message: 'User activated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
