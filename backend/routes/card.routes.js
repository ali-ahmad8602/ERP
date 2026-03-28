const router = require('express').Router();
const Card = require('../models/Card');
const Board = require('../models/Board');
const Activity = require('../models/Activity');
const notifications = require('../services/notification.service');
const {
  protect,
  requireBoardAccessFromQuery,
  requireBoardAccessFromCard,
} = require('../middleware/auth');

router.use(protect);

// GET /api/cards?boardId=xxx — get all cards for a board
router.get('/', requireBoardAccessFromQuery('viewer'), async (req, res) => {
  try {
    const { boardId } = req.query;

    const cards = await Card.find({ board: boardId, isArchived: false })
      .sort('order')
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name')
      .populate('comments.author', 'name avatar')
      .populate('approval.approvers', 'name email')
      .populate('approval.approvedBy', 'name email');

    res.json({ cards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cards — create card
router.post('/', async (req, res) => {
  try {
    const { title, description, board: boardId, column, assignees, dueDate, priority, labels, customFields } = req.body;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.settings.isLocked) return res.status(403).json({ message: 'Board is locked' });

    // Inline board access check for editor
    const { orgRole, departments, boardPermissions } = req.user;
    if (orgRole !== 'super_admin') {
      if (board.isCompanyBoard) {
        if (!['super_admin', 'top_management', 'org_admin'].includes(orgRole)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else if (board.department) {
        const deptMembership = departments.find(
          d => d.department.toString() === board.department.toString()
        );
        if (!deptMembership && orgRole !== 'top_management' && orgRole !== 'org_admin') {
          return res.status(403).json({ message: 'You do not have access to this board' });
        }
      }
      // Check board-level permission
      const boardPerm = boardPermissions.find(b => b.board.toString() === boardId.toString());
      const effectiveRole = boardPerm?.role || 'editor';
      const hierarchy = { board_owner: 4, editor: 3, commenter: 2, viewer: 1 };
      if ((hierarchy[effectiveRole] || 0) < hierarchy['editor']) {
        return res.status(403).json({ message: 'Insufficient board permissions to create cards' });
      }
    }

    // Set approval if board requires it
    const approval = board.settings.requiresApproval
      ? { required: true, approvers: board.settings.approvers, status: 'pending' }
      : { required: false };

    const lastCard = await Card.findOne({ board: boardId, column }).sort('-order');
    const order = lastCard ? lastCard.order + 1 : 0;

    const card = await Card.create({
      title, description, board: boardId, column,
      assignees, dueDate, priority, labels, customFields,
      approval, order,
      createdBy: req.user._id,
      auditLog: [{ user: req.user._id, action: 'created', detail: 'Card created' }]
    });

    await card.populate('assignees', 'name email avatar');

    Activity.log({ user: req.user._id, action: 'card_created', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id }).catch(() => {});
    notifications.notifyCardAssignees(card, req.user._id).catch(() => {});
    if (card.approval?.required && card.approval.approvers?.length > 0) {
      notifications.notifyApprovers(card, card.approval.approvers, req.user._id).catch(() => {});
    }

    res.status(201).json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cards/:cardId
router.get('/:cardId', requireBoardAccessFromCard('viewer'), async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name avatar')
      .populate('comments.author', 'name avatar')
      .populate('auditLog.user', 'name avatar')
      .populate('approval.approvers', 'name email avatar')
      .populate('approval.approvedBy', 'name email avatar');

    if (!card || card.isArchived) return res.status(404).json({ message: 'Card not found' });
    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/cards/:cardId — update card
router.patch('/:cardId', requireBoardAccessFromCard('editor'), async (req, res) => {
  try {
    const card = req.card;
    const board = req.board;
    if (board.settings.isLocked) return res.status(403).json({ message: 'Board is locked' });

    const allowed = ['title', 'description', 'assignees', 'dueDate', 'priority', 'labels', 'customFields', 'isComplianceTagged'];
    allowed.forEach(f => { if (req.body[f] !== undefined) card[f] = req.body[f]; });

    card.auditLog.push({ user: req.user._id, action: 'edited', detail: 'Card updated' });
    await card.save();

    Activity.log({ user: req.user._id, action: 'card_edited', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id }).catch(() => {});

    await card.populate('assignees', 'name email avatar');
    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/cards/:cardId/move — move card to different column
router.patch('/:cardId/move', requireBoardAccessFromCard('editor'), async (req, res) => {
  try {
    const { columnId, order } = req.body;
    const card = req.card;
    const board = req.board;
    if (board.settings.isLocked) return res.status(403).json({ message: 'Board is locked' });

    // Get column names for audit log
    const fromCol = board.columns.id(card.column)?.name || 'Unknown';
    const toCol   = board.columns.id(columnId)?.name || 'Unknown';

    card.column = columnId;
    if (order !== undefined) card.order = order;
    card.auditLog.push({ user: req.user._id, action: 'moved', detail: `${fromCol} → ${toCol}` });

    await card.save();

    Activity.log({ user: req.user._id, action: 'card_moved', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id, detail: `${fromCol} → ${toCol}` }).catch(() => {});
    notifications.notifyCardMoved(card, `${fromCol} → ${toCol}`, req.user._id).catch(() => {});

    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cards/:cardId/comments
router.post('/:cardId/comments', requireBoardAccessFromCard('commenter'), async (req, res) => {
  try {
    const card = req.card;
    card.comments.push({ author: req.user._id, text: req.body.text });
    card.auditLog.push({ user: req.user._id, action: 'commented' });
    await card.save();

    const board = req.board;
    Activity.log({ user: req.user._id, action: 'comment_added', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id }).catch(() => {});
    notifications.notifyCommentSubscribers(card, req.user._id).catch(() => {});

    await card.populate('comments.author', 'name avatar');
    res.status(201).json({ comments: card.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cards/:cardId/approve — approve a card
router.post('/:cardId/approve', requireBoardAccessFromCard('viewer'), async (req, res) => {
  try {
    const card = req.card;
    if (!card.approval?.required) return res.status(400).json({ message: 'This card does not require approval' });

    const isApprover = card.approval.approvers.some(a => a.toString() === req.user._id.toString());
    if (!isApprover && !['super_admin', 'org_admin'].includes(req.user.orgRole)) {
      return res.status(403).json({ message: 'You are not an approver for this card' });
    }

    if (!card.approval.approvedBy.includes(req.user._id)) {
      card.approval.approvedBy.push(req.user._id);
    }

    // All approvers have approved
    if (card.approval.approvedBy.length >= card.approval.approvers.length) {
      card.approval.status = 'approved';
    }

    card.auditLog.push({ user: req.user._id, action: 'approved' });
    await card.save();

    const board = req.board;
    Activity.log({ user: req.user._id, action: 'card_approved', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id }).catch(() => {});
    notifications.notifyApprovalResult(card, 'approved', req.user._id).catch(() => {});

    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cards/:cardId/reject
router.post('/:cardId/reject', requireBoardAccessFromCard('viewer'), async (req, res) => {
  try {
    const card = req.card;
    if (!card.approval?.required) return res.status(400).json({ message: 'No approval required' });

    card.approval.status = 'rejected';
    card.approval.rejectionReason = req.body.reason || '';
    card.auditLog.push({ user: req.user._id, action: 'rejected', detail: req.body.reason });
    await card.save();

    const board = req.board;
    Activity.log({ user: req.user._id, action: 'card_rejected', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id, detail: req.body.reason }).catch(() => {});
    notifications.notifyApprovalResult(card, 'rejected', req.user._id).catch(() => {});

    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cards/:cardId — archive card
router.delete('/:cardId', requireBoardAccessFromCard('editor'), async (req, res) => {
  try {
    const card = req.card;
    card.isArchived = true;
    card.auditLog.push({ user: req.user._id, action: 'archived' });
    await card.save();

    const board = req.board;
    Activity.log({ user: req.user._id, action: 'card_archived', entityType: 'card', entityId: card._id, entityTitle: card.title, department: board.department, board: board._id }).catch(() => {});

    res.json({ message: 'Card archived' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
