const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');
const Department = require('../models/Department');

// ─── Attach user to request ───────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ─── Org-level role guards ────────────────────────────────────────────────────
const requireOrgRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.orgRole)) {
    return res.status(403).json({ message: 'Insufficient organisation-level permissions' });
  }
  next();
};

const isSuperAdmin = requireOrgRole('super_admin');
const isOrgAdmin   = requireOrgRole('super_admin', 'org_admin');

// ─── Department-level guard ───────────────────────────────────────────────────
// Super admin & top_management bypass dept checks (top_management read+write, no settings)
const requireDeptAccess = (minRole = 'member') => async (req, res, next) => {
  const { orgRole, departments } = req.user;

  // Super admin can do anything
  if (orgRole === 'super_admin') return next();

  const deptId = req.params.deptId || req.body.department;
  if (!deptId) return res.status(400).json({ message: 'Department not specified' });

  // Top management gets full read+work access to all depts (but not settings routes)
  if (orgRole === 'top_management') {
    req.deptRole = 'top_management';
    return next();
  }

  const membership = departments.find(d => d.department.toString() === deptId.toString());
  if (!membership) return res.status(403).json({ message: 'You are not a member of this department' });

  const roleHierarchy = { dept_head: 3, member: 2, guest: 1 };
  const required = roleHierarchy[minRole] || 1;
  const actual   = roleHierarchy[membership.role] || 0;

  if (actual < required) {
    return res.status(403).json({ message: 'Insufficient department-level permissions' });
  }

  req.deptRole = membership.role;
  next();
};

// ─── Board-level guard ────────────────────────────────────────────────────────
const requireBoardAccess = (minRole = 'viewer') => async (req, res, next) => {
  const { orgRole, departments, boardPermissions } = req.user;

  const boardId = req.params.boardId || req.body.board;
  if (!boardId) return res.status(400).json({ message: 'Board not specified' });

  const board = await Board.findById(boardId);
  if (!board || !board.isActive) return res.status(404).json({ message: 'Board not found' });

  if (orgRole === 'super_admin') {
    req.board = board;
    req.boardRole = 'board_owner';
    return next();
  }

  // Company board: top_management + super_admin only
  if (board.isCompanyBoard) {
    if (!['super_admin', 'top_management', 'org_admin'].includes(orgRole)) {
      return res.status(403).json({ message: 'Company board is restricted to top management' });
    }
    req.board = board;
    return next();
  }

  // Top management can access all dept boards (read+work)
  if (orgRole === 'top_management') {
    req.board = board;
    req.boardRole = 'editor';
    return next();
  }

  // Check dept membership
  if (board.department) {
    const deptMembership = departments.find(
      d => d.department.toString() === board.department.toString()
    );
    if (!deptMembership) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }
  }

  // Check board-level permission override
  const boardPerm = boardPermissions.find(b => b.board.toString() === boardId.toString());
  const effectiveRole = boardPerm?.role || 'editor'; // dept members default to editor

  const boardRoleHierarchy = { board_owner: 4, editor: 3, commenter: 2, viewer: 1 };
  const required = boardRoleHierarchy[minRole] || 1;
  const actual   = boardRoleHierarchy[effectiveRole] || 0;

  if (actual < required) {
    return res.status(403).json({ message: 'Insufficient board-level permissions' });
  }

  req.board = board;
  req.boardRole = effectiveRole;
  next();
};

// ─── Board access from query param (for card list) ───────────────────────────
const requireBoardAccessFromQuery = (minRole = 'viewer') => async (req, res, next) => {
  const boardId = req.query.boardId;
  if (!boardId) return res.status(400).json({ message: 'boardId is required' });
  req.params.boardId = boardId;
  return requireBoardAccess(minRole)(req, res, next);
};

// ─── Board access from card (loads card, then checks its board) ──────────────
const requireBoardAccessFromCard = (minRole = 'viewer') => async (req, res, next) => {
  const Card = require('../models/Card');
  const cardId = req.params.cardId;
  if (!cardId) return res.status(400).json({ message: 'cardId is required' });

  const card = await Card.findById(cardId);
  if (!card || card.isArchived) return res.status(404).json({ message: 'Card not found' });

  req.card = card;
  req.params.boardId = card.board.toString();
  return requireBoardAccess(minRole)(req, res, next);
};

// ─── Settings guard — blocks top_management from settings routes ──────────────
const noSettingsForTopMgmt = (req, res, next) => {
  if (req.user.orgRole === 'top_management') {
    return res.status(403).json({ message: 'Top management does not have access to settings' });
  }
  next();
};

// ─── Dept head user management guard ─────────────────────────────────────────
// Dept head can only add/remove users ranked below them in their own dept
const canManageDeptUser = async (req, res, next) => {
  const { orgRole, departments } = req.user;

  if (orgRole === 'super_admin' || orgRole === 'org_admin') return next();

  const deptId = req.params.deptId;
  const membership = departments.find(d => d.department.toString() === deptId);

  if (!membership || membership.role !== 'dept_head') {
    return res.status(403).json({ message: 'Only department heads can manage department users' });
  }

  // Dept heads cannot assign roles equal to or above dept_head
  const { role: targetRole } = req.body;
  if (targetRole && ['dept_head', 'top_management', 'super_admin', 'org_admin'].includes(targetRole)) {
    return res.status(403).json({ message: 'You cannot assign this role' });
  }

  next();
};

module.exports = {
  protect,
  isSuperAdmin,
  isOrgAdmin,
  requireOrgRole,
  requireDeptAccess,
  requireBoardAccess,
  requireBoardAccessFromQuery,
  requireBoardAccessFromCard,
  noSettingsForTopMgmt,
  canManageDeptUser
};
