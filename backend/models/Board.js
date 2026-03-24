const mongoose = require('mongoose');

// Custom field definition (per board)
const customFieldSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'url', 'user'],
    required: true
  },
  options: [String],      // for dropdown type
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

// Column definition
const columnSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  color: { type: String, default: '#2A2A2A' },
  order: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false } // prevent deletion of core columns
});

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  // null = Company board (top management only)
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  isCompanyBoard: { type: Boolean, default: false },

  columns: [columnSchema],
  customFields: [customFieldSchema],

  // Board-level settings
  settings: {
    requiresApproval: { type: Boolean, default: false },       // optional per board
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isLocked: { type: Boolean, default: false },               // audit/read-only lock
    complianceTagging: { type: Boolean, default: false }       // fintech: flag compliance cards
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Default columns helper
boardSchema.statics.defaultColumns = () => [
  { name: 'Ideas', order: 0, isDefault: true },
  { name: 'Backlog', order: 1, isDefault: true },
  { name: 'In Progress', order: 2, isDefault: true },
  { name: 'In Review', order: 3, isDefault: true },
  { name: 'Done', order: 4, isDefault: true }
];

module.exports = mongoose.model('Board', boardSchema);
