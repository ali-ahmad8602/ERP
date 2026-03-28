const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'task_assigned',
      'comment_added',
      'approval_requested',
      'card_approved',
      'card_rejected',
      'due_date_reminder',
      'mentioned',
      'card_moved',
      'member_added',
    ]
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  entityType: { type: String, enum: ['card', 'board', 'department'], default: 'card' },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
}, { timestamps: true });

// Indexes for fast queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
// TTL — auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
