const express = require('express');
const {
  createPost,
  getAllPosts,
  getPostById,   // ✅ MAKE SURE THIS IS IMPORTED!
  getMyPosts,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  toggleLockPost,
  toggleHidePost,
  toggleCommentVisibility
} = require('../controllers/postController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

// 📝 All Logged-in Users
router.post('/create', authenticate, createPost);
router.get('/timeline', authenticate, getAllPosts);
router.get('/my-posts', authenticate, getMyPosts);
router.get('/getPost/:id', authenticate, getPostById); // ✅ MAKE SURE THIS ROUTE EXISTS!
router.patch('/like/:id', authenticate, toggleLike);
router.patch('/comment/:id', authenticate, addComment);

// ✏️ Post Owner Only
router.patch('/update/:id', authenticate, updatePost);
router.delete('/delete/:id', authenticate, deletePost);

// 🛡️ Admin Only
router.patch('/lock/:id', authenticate, isAdmin, toggleLockPost);
router.patch('/hide/:id', authenticate, isAdmin, toggleHidePost);
router.patch('/comment-visibility/:postId/:commentIndex', authenticate, isAdmin, toggleCommentVisibility);

module.exports = router;