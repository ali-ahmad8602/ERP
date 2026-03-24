const Notification = require('../models/Notification');

// ─── Get io instance from Express app ────────────────────────────────────────
let _io = null;
function getIO() {
  if (!_io) {
    try { _io = require('../server').io; } catch { /* not yet initialized */ }
  }
  return _io;
}

// Set io externally (called from server.js after init)
function setIO(io) { _io = io; }

// ─── Core: create notification + push via socket ─────────────────────────────
async function createNotification({ recipient, type, title, message, entityType, entityId, department, sender }) {
  // Don't notify yourself
  if (sender && recipient.toString() === sender.toString()) return null;

  const notification = await Notification.create({
    recipient, type, title, message: message || '',
    entityType, entityId, department, sender,
  });

  // Populate for the socket payload
  const populated = await Notification.findById(notification._id)
    .populate('sender', 'name avatar')
    .populate('department', 'name slug icon color')
    .lean();

  // Push via Socket.io
  const io = getIO();
  if (io) {
    io.to(`user:${recipient}`).emit('notification', populated);
  }

  return notification;
}

// ─── Bulk helper ─────────────────────────────────────────────────────────────
async function notifyMany(recipientIds, data) {
  const promises = recipientIds.map(recipientId =>
    createNotification({ ...data, recipient: recipientId }).catch(() => {})
  );
  return Promise.all(promises);
}

// ─── Card assignees notification ─────────────────────────────────────────────
async function notifyCardAssignees(card, sender, { type = 'task_assigned', titleOverride } = {}) {
  if (!card.assignees || card.assignees.length === 0) return;

  const assigneeIds = card.assignees.map(a => a._id?.toString() || a.toString());

  return notifyMany(assigneeIds, {
    type,
    title: titleOverride || 'Card assigned to you',
    message: `You were assigned to "${card.title}"`,
    entityType: 'card',
    entityId: card._id,
    department: card.board?.department || null,
    sender,
  });
}

// ─── Notify approvers ────────────────────────────────────────────────────────
async function notifyApprovers(card, approvers, sender) {
  const approverIds = approvers.map(a => a._id?.toString() || a.toString());

  return notifyMany(approverIds, {
    type: 'approval_requested',
    title: 'Approval requested',
    message: `"${card.title}" needs your approval`,
    entityType: 'card',
    entityId: card._id,
    department: card.board?.department || null,
    sender,
  });
}

// ─── Notify comment subscribers (assignees + previous commenters) ────────────
async function notifyCommentSubscribers(card, sender) {
  const subscriberSet = new Set();

  // Assignees
  if (card.assignees) {
    card.assignees.forEach(a => subscriberSet.add(a._id?.toString() || a.toString()));
  }

  // Previous commenters
  if (card.comments) {
    card.comments.forEach(c => {
      if (c.author) subscriberSet.add(c.author._id?.toString() || c.author.toString());
    });
  }

  // Remove sender
  subscriberSet.delete(sender.toString());

  if (subscriberSet.size === 0) return;

  return notifyMany([...subscriberSet], {
    type: 'comment_added',
    title: 'New comment',
    message: `Someone commented on "${card.title}"`,
    entityType: 'card',
    entityId: card._id,
    department: card.board?.department || null,
    sender,
  });
}

// ─── Notify card creator + assignees on approve/reject ───────────────────────
async function notifyApprovalResult(card, status, sender) {
  const recipientSet = new Set();

  if (card.createdBy) recipientSet.add(card.createdBy._id?.toString() || card.createdBy.toString());
  if (card.assignees) {
    card.assignees.forEach(a => recipientSet.add(a._id?.toString() || a.toString()));
  }

  recipientSet.delete(sender.toString());

  if (recipientSet.size === 0) return;

  const type = status === 'approved' ? 'card_approved' : 'card_rejected';
  const title = status === 'approved' ? 'Card approved' : 'Card rejected';

  return notifyMany([...recipientSet], {
    type,
    title,
    message: `"${card.title}" was ${status}`,
    entityType: 'card',
    entityId: card._id,
    department: card.board?.department || null,
    sender,
  });
}

// ─── Notify on card move ─────────────────────────────────────────────────────
async function notifyCardMoved(card, detail, sender) {
  if (!card.assignees || card.assignees.length === 0) return;

  const assigneeIds = card.assignees
    .map(a => a._id?.toString() || a.toString())
    .filter(id => id !== sender.toString());

  if (assigneeIds.length === 0) return;

  return notifyMany(assigneeIds, {
    type: 'card_moved',
    title: 'Card moved',
    message: `"${card.title}" was moved ${detail}`,
    entityType: 'card',
    entityId: card._id,
    department: card.board?.department || null,
    sender,
  });
}

// ─── Notify on dept member add ───────────────────────────────────────────────
async function notifyMemberAdded(userId, department, sender) {
  return createNotification({
    recipient: userId,
    type: 'member_added',
    title: 'Added to department',
    message: `You were added to "${department.name}"`,
    entityType: 'department',
    entityId: department._id,
    department: department._id,
    sender,
  });
}

module.exports = {
  setIO,
  createNotification,
  notifyCardAssignees,
  notifyApprovers,
  notifyCommentSubscribers,
  notifyApprovalResult,
  notifyCardMoved,
  notifyMemberAdded,
};
