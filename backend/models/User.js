const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const boardPermissionSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
  role: { type: String, enum: ['board_owner', 'editor', 'commenter', 'viewer'], default: 'viewer' }
}, { _id: false });

const deptMembershipSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  role: { type: String, enum: ['dept_head', 'member', 'guest'], default: 'member' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  avatar: { type: String, default: null },

  // Organisation-level role
  orgRole: {
    type: String,
    enum: ['super_admin', 'org_admin', 'top_management', 'user'],
    default: 'user'
  },

  // Department memberships (a user can be in multiple depts)
  departments: [deptMembershipSchema],

  // Board-level permissions (fine-grained overrides)
  boardPermissions: [boardPermissionSchema],

  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  passwordChangedAt: { type: Date }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
