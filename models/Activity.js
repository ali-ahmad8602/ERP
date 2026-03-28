const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'card_created', 'card_edited', 'card_moved', 'card_archived',
      'comment_added', 'card_approved', 'card_rejected',
      'board_created', 'board_updated', 'board_archived',
      'member_added', 'member_removed',
    ]
  },
  entityType: { type: String, required: true, enum: ['card', 'board', 'department'] },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityTitle: { type: String, default: '' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', default: null },
  detail: { type: String, default: '' },
}, { timestamps: true });

activitySchema.index({ department: 1, createdAt: -1 });
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

// Helper to create an activity entry
activitySchema.statics.log = function (data) {
  return this.create(data);
};

module.exports = mongoose.model('Activity', activitySchema);
