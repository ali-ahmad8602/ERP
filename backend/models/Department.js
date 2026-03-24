const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🏢' },
  color: { type: String, default: '#0454FC' }, // accent color per dept

  // Department head(s)
  heads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // All members (including heads)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 } // for sidebar ordering
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
