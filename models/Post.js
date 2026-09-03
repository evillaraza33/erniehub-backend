const mongoose = require('mongoose');

// 💬 Comment Subdocument — NOW with Hide capability!
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  isHidden: {
    type: Boolean,
    default: false  
  },
  createdAt: { type: Date, default: Date.now }
});

// 📝 Post Main Schema
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Post content cannot be empty"],
    maxlength: [3000, "Post is too long (max 3000 characters)"]
  },
  imageUrl: {                     
      type: String,
      default: null
    },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  isLocked: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);