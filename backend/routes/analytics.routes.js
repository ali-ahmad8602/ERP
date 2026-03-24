const router = require('express').Router();
const mongoose = require('mongoose');
const Card = require('../models/Card');
const Board = require('../models/Board');
const Department = require('../models/Department');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

router.use(protect);

// ─── Helper: get accessible department IDs for user ──────────────────────────
async function getAccessibleDeptIds(user) {
  const { orgRole, departments: userDepts } = user;
  if (['super_admin', 'org_admin', 'top_management'].includes(orgRole)) {
    const allDepts = await Department.find({ isActive: true }).select('_id');
    return allDepts.map(d => d._id);
  }
  return userDepts.map(d => d.department);
}

// GET /api/analytics/overview — org-wide stats
router.get('/overview', async (req, res) => {
  try {
    const deptIds = await getAccessibleDeptIds(req.user);
    const boards = await Board.find({ department: { $in: deptIds }, isActive: true }).select('_id columns');
    const boardIds = boards.map(b => b._id);

    // Build a map of column name → column IDs across all boards
    const doneColumnIds = [];
    const inProgressColumnIds = [];
    for (const board of boards) {
      for (const col of board.columns) {
        const name = col.name.toLowerCase();
        if (name === 'done') doneColumnIds.push(col._id);
        else if (name === 'in progress') inProgressColumnIds.push(col._id);
      }
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCards,
      doneCount,
      inProgressCount,
      overdueCount,
      pendingApprovals,
      complianceItems,
      createdThisWeek,
      createdThisMonth,
    ] = await Promise.all([
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, column: { $in: doneColumnIds } }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, column: { $in: inProgressColumnIds } }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, dueDate: { $lt: now, $ne: null }, column: { $nin: doneColumnIds } }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, 'approval.required': true, 'approval.status': 'pending' }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, isComplianceTagged: true }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, createdAt: { $gte: weekAgo } }),
      Card.countDocuments({ board: { $in: boardIds }, isArchived: false, createdAt: { $gte: monthAgo } }),
    ]);

    res.json({
      totalCards,
      doneCount,
      inProgressCount,
      overdueCount,
      pendingApprovals,
      complianceItems,
      createdThisWeek,
      createdThisMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/departments — per-department breakdown
router.get('/departments', async (req, res) => {
  try {
    const deptIds = await getAccessibleDeptIds(req.user);
    const departments = await Department.find({ _id: { $in: deptIds }, isActive: true })
      .select('name slug icon color members')
      .lean();

    const results = await Promise.all(departments.map(async (dept) => {
      const boards = await Board.find({ department: dept._id, isActive: true }).select('_id columns');
      const boardIds = boards.map(b => b._id);

      const doneColumnIds = [];
      const inProgressColumnIds = [];
      for (const board of boards) {
        for (const col of board.columns) {
          const name = col.name.toLowerCase();
          if (name === 'done') doneColumnIds.push(col._id);
          else if (name === 'in progress') inProgressColumnIds.push(col._id);
        }
      }

      const now = new Date();
      const [totalCards, doneCount, inProgressCount, overdueCount] = await Promise.all([
        Card.countDocuments({ board: { $in: boardIds }, isArchived: false }),
        Card.countDocuments({ board: { $in: boardIds }, isArchived: false, column: { $in: doneColumnIds } }),
        Card.countDocuments({ board: { $in: boardIds }, isArchived: false, column: { $in: inProgressColumnIds } }),
        Card.countDocuments({ board: { $in: boardIds }, isArchived: false, dueDate: { $lt: now, $ne: null }, column: { $nin: doneColumnIds } }),
      ]);

      return {
        department: { _id: dept._id, name: dept.name, slug: dept.slug, icon: dept.icon, color: dept.color },
        totalCards,
        doneCount,
        inProgressCount,
        overdueCount,
        memberCount: dept.members?.length || 0,
      };
    }));

    res.json({ departments: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/activity — recent activity feed
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const deptIds = await getAccessibleDeptIds(req.user);

    const query = {
      $or: [
        { department: { $in: deptIds } },
        { department: null }, // company-level activities
      ]
    };
    if (before) query.createdAt = { $lt: new Date(before) };

    const activities = await Activity.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .populate('department', 'name slug icon color')
      .lean();

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
