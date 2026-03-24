const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Invite = require('../models/Invite');
const User = require('../models/User');
const Department = require('../models/Department');
const { protect, isOrgAdmin } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

// ─── Protected routes (admin only) ──────────────────────────────────────────

// POST /api/invites — create invite
router.post('/', protect, isOrgAdmin, async (req, res) => {
  try {
    const { email, orgRole = 'user', departments = [] } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: 'A user with this email already exists' });

    // Check for existing pending invite
    const existingInvite = await Invite.findOne({ email: email.toLowerCase(), status: 'pending', expiresAt: { $gt: new Date() } });
    if (existingInvite) return res.status(409).json({ message: 'A pending invite already exists for this email' });

    const token = Invite.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await Invite.create({
      email: email.toLowerCase(),
      orgRole,
      departments,
      invitedBy: req.user._id,
      token,
      expiresAt,
    });

    await invite.populate([
      { path: 'invitedBy', select: 'name email' },
      { path: 'departments.department', select: 'name slug icon color' },
    ]);

    const inviteUrl = `${CLIENT_URL}/invite/${token}`;

    res.status(201).json({ invite, inviteUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invites — list all invites
router.get('/', protect, isOrgAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const invites = await Invite.find(query)
      .sort('-createdAt')
      .populate('invitedBy', 'name email avatar')
      .populate('departments.department', 'name slug icon color');

    res.json({ invites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/invites/:id — revoke invite
router.delete('/:id', protect, isOrgAdmin, async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.status !== 'pending') return res.status(400).json({ message: 'Can only revoke pending invites' });

    invite.status = 'expired';
    await invite.save();
    res.json({ message: 'Invite revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Public routes (no auth) ────────────────────────────────────────────────

// GET /api/invites/validate/:token — check if invite is valid
router.get('/validate/:token', async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token })
      .populate('departments.department', 'name slug icon color');

    if (!invite) return res.json({ valid: false, reason: 'Invite not found' });
    if (invite.status === 'accepted') return res.json({ valid: false, reason: 'Invite already used' });
    if (invite.status === 'expired') return res.json({ valid: false, reason: 'Invite has been revoked' });
    if (invite.expiresAt < new Date()) return res.json({ valid: false, reason: 'Invite has expired' });

    res.json({
      valid: true,
      email: invite.email,
      orgRole: invite.orgRole,
      departments: invite.departments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/invites/accept/:token — register via invite
router.post('/accept/:token', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) return res.status(400).json({ message: 'Name and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const invite = await Invite.findOne({ token: req.params.token });

    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.status !== 'pending') return res.status(400).json({ message: 'Invite is no longer valid' });
    if (invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    // Check if email already registered (shouldn't happen but safety check)
    const existing = await User.findOne({ email: invite.email });
    if (existing) return res.status(409).json({ message: 'A user with this email already exists' });

    // Create user
    const user = await User.create({
      name,
      email: invite.email,
      password,
      orgRole: invite.orgRole,
      departments: invite.departments.map(d => ({
        department: d.department,
        role: d.role,
      })),
    });

    // Add user to department member/head lists
    for (const deptEntry of invite.departments) {
      const dept = await Department.findById(deptEntry.department);
      if (dept) {
        if (!dept.members.includes(user._id)) dept.members.push(user._id);
        if (deptEntry.role === 'dept_head' && !dept.heads.includes(user._id)) dept.heads.push(user._id);
        await dept.save();
      }
    }

    // Mark invite as accepted
    invite.status = 'accepted';
    await invite.save();

    // Return JWT
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
