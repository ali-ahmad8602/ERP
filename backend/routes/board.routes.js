const router = require('express').Router();
const Board = require('../models/Board');
const Activity = require('../models/Activity');
const { protect, requireDeptAccess, requireBoardAccess, noSettingsForTopMgmt, isOrgAdmin } = require('../middleware/auth');

router.use(protect);

// GET /api/boards?deptId=xxx — list boards for a department
router.get('/', async (req, res) => {
  try {
    const { deptId, companyBoards } = req.query;
    const { orgRole, departments } = req.user;

    let query = { isActive: true };

    if (companyBoards) {
      // Company boards: top management + admins only
      if (!['super_admin', 'org_admin', 'top_management'].includes(orgRole)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      query.isCompanyBoard = true;
    } else if (deptId) {
      // Check access to this dept
      if (!['super_admin', 'org_admin', 'top_management'].includes(orgRole)) {
        const hasDept = departments.some(d => d.department.toString() === deptId);
        if (!hasDept) return res.status(403).json({ message: 'Access denied to this department' });
      }
      query.department = deptId;
    } else {
      return res.status(400).json({ message: 'Provide deptId or companyBoards=true' });
    }

    const boards = await Board.find(query)
      .sort('order')
      .populate('createdBy', 'name');

    res.json({ boards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/boards — create board
router.post('/', noSettingsForTopMgmt, async (req, res) => {
  try {
    const { name, description, department, isCompanyBoard } = req.body;
    const { orgRole, departments: userDepts } = req.user;

    // Only admins can create company boards
    if (isCompanyBoard && !['super_admin', 'org_admin'].includes(orgRole)) {
      return res.status(403).json({ message: 'Only admins can create company boards' });
    }

    // Verify department access for non-company boards
    if (!isCompanyBoard && department) {
      if (!['super_admin', 'org_admin'].includes(orgRole)) {
        const hasDept = userDepts.some(d => d.department.toString() === department);
        if (!hasDept) {
          return res.status(403).json({ message: 'You do not have access to this department' });
        }
      }
    }

    const board = await Board.create({
      name,
      description,
      department: isCompanyBoard ? null : department,
      isCompanyBoard: !!isCompanyBoard,
      columns: Board.defaultColumns(),
      createdBy: req.user._id
    });

    Activity.log({ user: req.user._id, action: 'board_created', entityType: 'board', entityId: board._id, entityTitle: board.name, department: board.department, board: board._id }).catch(() => {});

    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/boards/:boardId
router.get('/:boardId', requireBoardAccess('viewer'), async (req, res) => {
  try {
    const board = await req.board.populate([
      { path: 'settings.approvers', select: 'name email avatar' },
      { path: 'createdBy', select: 'name' }
    ]);
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/boards/:boardId — update board settings/name
router.patch('/:boardId', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const allowed = ['name', 'description', 'settings', 'order'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const board = await Board.findByIdAndUpdate(req.params.boardId, updates, { new: true });
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/boards/:boardId — soft delete
router.delete('/:boardId', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    await Board.findByIdAndUpdate(req.params.boardId, { isActive: false });
    res.json({ message: 'Board archived' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Column Management ────────────────────────────────────────────────────────

// POST /api/boards/:boardId/columns
router.post('/:boardId/columns', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const { name, color } = req.body;
    const board = await Board.findById(req.params.boardId);
    const order = board.columns.length;
    board.columns.push({ name, color, order });
    await board.save();
    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/boards/:boardId/columns/:columnId
router.patch('/:boardId/columns/:columnId', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    const col = board.columns.id(req.params.columnId);
    if (!col) return res.status(404).json({ message: 'Column not found' });
    if (req.body.name) col.name = req.body.name;
    if (req.body.color) col.color = req.body.color;
    if (req.body.order !== undefined) col.order = req.body.order;
    await board.save();
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/boards/:boardId/columns/:columnId
router.delete('/:boardId/columns/:columnId', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    const col = board.columns.id(req.params.columnId);
    if (!col) return res.status(404).json({ message: 'Column not found' });
    if (col.isDefault) return res.status(400).json({ message: 'Cannot delete a default column' });
    col.deleteOne();
    await board.save();
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Custom Fields ────────────────────────────────────────────────────────────

// POST /api/boards/:boardId/fields
router.post('/:boardId/fields', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const { name, type, options, required } = req.body;
    const board = await Board.findById(req.params.boardId);
    board.customFields.push({ name, type, options, required, order: board.customFields.length });
    await board.save();
    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/boards/:boardId/fields/:fieldId
router.patch('/:boardId/fields/:fieldId', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    const field = board.customFields.id(req.params.fieldId);
    if (!field) return res.status(404).json({ message: 'Field not found' });
    ['name', 'options', 'required', 'order'].forEach(f => {
      if (req.body[f] !== undefined) field[f] = req.body[f];
    });
    await board.save();
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/boards/:boardId/fields/:fieldId
router.delete('/:boardId/fields/:fieldId', noSettingsForTopMgmt, requireBoardAccess('board_owner'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    const field = board.customFields.id(req.params.fieldId);
    if (!field) return res.status(404).json({ message: 'Field not found' });
    field.deleteOne();
    await board.save();
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
