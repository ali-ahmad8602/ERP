const mongoose = require('mongoose');

// Comment sub-document
const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Audit log entry
const auditEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },   // e.g. 'moved', 'edited', 'commented', 'approved'
  detail: { type: String, default: '' },       // e.g. 'Backlog → In Progress'
  createdAt: { type: Date, default: Date.now }
});

// Custom field value
const fieldValueSchema = new mongoose.Schema({
  field: { type: mongoose.Schema.Types.ObjectId, required: true }, // ref to board.customFields._id
  value: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

// Approval sub-document
const approvalSchema = new mongoose.Schema({
  required: { type: Boolean, default: false },
  approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' }
}, { _id: false });

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  column: { type: mongoose.Schema.Types.ObjectId, required: true }, // ref to board.columns._id

  // Core fields (removable via board config)
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date, default: null },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low', 'none'],
    default: 'none'
  },
  labels: [{ type: String, trim: true }],

  // Custom field values
  customFields: [fieldValueSchema],

  // Attachments
  attachments: [{
    name: String,
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Approval workflow (if board.settings.requiresApproval)
  approval: approvalSchema,

  // Fintech: compliance tag
  isComplianceTagged: { type: Boolean, default: false },

  // Audit trail
  auditLog: [auditEntrySchema],
  comments: [commentSchema],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Index for fast board queries
cardSchema.index({ board: 1, column: 1, order: 1 });
cardSchema.index({ board: 1, isArchived: 1 });

module.exports = mongoose.model('Card', cardSchema);
