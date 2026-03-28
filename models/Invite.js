const mongoose = require('mongoose');
const crypto = require('crypto');

const inviteDeptSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  role: { type: String, enum: ['dept_head', 'member', 'guest'], default: 'member' }
}, { _id: false });

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  orgRole: {
    type: String,
    enum: ['org_admin', 'top_management', 'user'],
    default: 'user'
  },
  departments: [inviteDeptSchema],
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

inviteSchema.index({ email: 1 });
inviteSchema.index({ token: 1 });
inviteSchema.index({ status: 1, expiresAt: 1 });

// Generate a secure token
inviteSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('Invite', inviteSchema);
