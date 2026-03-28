const router = require('express').Router();
const mongoose = require('mongoose');
const Department = require('../models/Department');
const User = require('../models/User');
const Board = require('../models/Board');
const { protect, isOrgAdmin, requireDeptAccess, noSettingsForTopMgmt, canManageDeptUser } = require('../middleware/auth');
const notifications = require('../services/notification.service');

// All routes require auth
router.use(protect);

// GET /api/departments — list all (admins see all, others see their own)
router.get('/', async (req, res) => {
  try {
    let depts;
    const { orgRole, departments: userDepts } = req.user;

    if (['super_admin', 'org_admin', 'top_management'].includes(orgRole)) {
      depts = await Department.find({ isActive: true })
        .sort('order')
        .populate('heads', 'name email avatar')
        .populate('members', 'name email avatar');
    } else {
      const deptIds = userDepts.map(d => d.department);
      depts = await Department.find({ _id: { $in: deptIds }, isActive: true })
        .sort('order')
        .populate('heads', 'name email avatar')
        .populate('members', 'name email avatar');
    }

    res.json({ departments: depts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/departments — create (admins only)
router.post('/', isOrgAdmin, noSettingsForTopMgmt, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const dept = await Department.create({ name, slug, description, icon, color });

    // Auto-create default board for department
    const Board = require('../models/Board');
    await Board.create({
      name: `${name} Backlog`,
      department: dept._id,
      columns: Board.defaultColumns(),
      createdBy: req.user._id
    });

    res.status(201).json({ department: dept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/departments/:deptId — supports both ObjectId and slug
router.get('/:deptId', async (req, res, next) => {
  try {
    const param = req.params.deptId;
    const isObjectId = mongoose.isValidObjectId(param);

    const dept = isObjectId
      ? await Department.findById(param)
      : await Department.findOne({ slug: param, isActive: true });

    if (!dept) return res.status(404).json({ message: 'Department not found' });

    // Set the resolved ID for downstream middleware
    req.params.deptId = dept._id.toString();

    // Run dept access check manually
    const { orgRole, departments: userDepts } = req.user;
    if (orgRole === 'super_admin') { /* bypass */ }
    else if (['org_admin', 'top_management'].includes(orgRole)) { /* can see all */ }
    else {
      const membership = userDepts.find(d => d.department.toString() === dept._id.toString());
      if (!membership) return res.status(403).json({ message: 'You are not a member of this department' });
    }

    await dept.populate('heads', 'name email avatar orgRole');
    await dept.populate('members', 'name email avatar orgRole');
    res.json({ department: dept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/departments/:deptId — update (admins + dept head, no top mgmt settings)
router.patch('/:deptId', noSettingsForTopMgmt, requireDeptAccess('dept_head'), async (req, res) => {
  try {
    const allowed = ['name', 'description', 'icon', 'color', 'order'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const dept = await Department.findByIdAndUpdate(req.params.deptId, updates, { new: true });
    res.json({ department: dept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/departments/:deptId — soft delete (admins only)
router.delete('/:deptId', isOrgAdmin, noSettingsForTopMgmt, async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.deptId, { isActive: false });
    res.json({ message: 'Department archived' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Member Management ────────────────────────────────────────────────────────

// POST /api/departments/:deptId/members — add member
router.post('/:deptId/members', canManageDeptUser, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const dept = await Department.findById(req.params.deptId);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add to dept members list
    if (!dept.members.includes(userId)) dept.members.push(userId);
    if (role === 'dept_head' && !dept.heads.includes(userId)) dept.heads.push(userId);
    await dept.save();

    // Add dept membership to user
    const existing = user.departments.find(d => d.department.toString() === req.params.deptId);
    if (existing) {
      existing.role = role;
    } else {
      user.departments.push({ department: req.params.deptId, role });
    }
    await user.save();

    notifications.notifyMemberAdded(userId, dept, req.user._id).catch(() => {});

    res.json({ message: 'Member added', department: dept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/departments/:deptId/members/:userId — remove member
router.delete('/:deptId/members/:userId', canManageDeptUser, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.deptId);
    dept.members = dept.members.filter(m => m.toString() !== req.params.userId);
    dept.heads   = dept.heads.filter(h => h.toString() !== req.params.userId);
    await dept.save();

    const user = await User.findById(req.params.userId);
    user.departments = user.departments.filter(d => d.department.toString() !== req.params.deptId);
    await user.save();

    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
