const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    maxlength: [30, "Username cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  bio: {
    type: String,
    default: "",
    maxlength: [160, "Bio cannot exceed 160 characters"]
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false  // 🚫 Admin can still block abusive users
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);