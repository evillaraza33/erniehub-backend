const express = require('express');
const {
  createPost,
  getAllPosts,
  getMyPosts,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  toggleLockPost,
  toggleHidePost,
  toggleCommentVisibility  // ✅ NEW
} = require('../controllers/postController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const router = express.Router();

// 📝 All Logged-in Users
router.post('/create', authenticate, createPost);
router.get('/timeline', authenticate, getAllPosts);
router.get('/my-posts', authenticate, getMyPosts);
router.patch('/like/:id', authenticate, toggleLike);
router.patch('/comment/:id', authenticate, addComment);

// ✏️ Owner ONLY — Update & Delete
router.patch('/update/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

// 🛡️ Admin ONLY — Moderation
router.patch('/lock/:id', authenticate, isAdmin, toggleLockPost);
router.patch('/hide/:id', authenticate, isAdmin, toggleHidePost);
router.patch('/:postId/comment/:commentIndex/hide', authenticate, isAdmin, toggleCommentVisibility); // ✅ NEW

module.exports = router;