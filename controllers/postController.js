const Post = require('../models/Post');

// ✅ Create Post
const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const post = await Post.create({
      content,
      imageUrl: imageUrl || null,  // ✅ ADDED: Save image URL (or null if empty)
      userId: req.user._id,
      username: req.user.username
    });
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ✅ Get ALL Posts — Admin sees Hidden posts & Hidden comments
const getAllPosts = async (req, res) => {
  try {
    let posts;
    if (req.user.isAdmin) {
      // Admin sees EVERYTHING — including hidden posts & hidden comments
      posts = await Post.find().sort({ createdAt: -1 });
    } else {
      // Regular users see non-hidden posts + only visible comments
      const allPosts = await Post.find({ isHidden: false }).sort({ createdAt: -1 });
      // Filter out hidden comments for non-admin users
      posts = allPosts.map(post => {
        post = post.toObject();
        post.comments = post.comments.filter(c => !c.isHidden);
        return post;
      });
    }
    return res.status(200).json({ posts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Get My Posts
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ posts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Like / Unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    return res.status(200).json({ message: hasLiked ? "Unliked" : "Liked", post });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Add Comment — ANY logged-in user
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.isLocked) {
      return res.status(403).json({ error: "Comments are locked for this post" });
    }

    post.comments.push({
      content: req.body.content,
      userId: req.user._id,
      username: req.user.username,
      isHidden: false
    });
    await post.save();
    return res.status(201).json({ message: "Comment added successfully", post });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Update Post — ONLY OWNER
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only update your own posts" });
    }

    post.content = req.body.content || post.content;
    await post.save();
    return res.status(200).json({ message: "Post updated successfully", post });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Post — ONLY OWNER
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ========== ADMIN ONLY FEATURES ==========

// ✅ Admin: Lock/Unlock Post Comments
const toggleLockPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.isLocked = !post.isLocked;
    await post.save();
    return res.status(200).json({ 
      message: post.isLocked ? "Post comments LOCKED" : "Post comments UNLOCKED",
      isLocked: post.isLocked
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Admin: Hide/Unhide Post
const toggleHidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.isHidden = !post.isHidden;
    await post.save();
    return res.status(200).json({ 
      message: post.isHidden ? "Post HIDDEN from public" : "Post VISIBLE to public",
      isHidden: post.isHidden
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ ADMIN: Hide/Unhide a SPECIFIC Comment 🛡️💬
const toggleCommentVisibility = async (req, res) => {
  try {
    const { postId, commentIndex } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.comments[commentIndex]) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Toggle hidden status
    post.comments[commentIndex].isHidden = !post.comments[commentIndex].isHidden;
    await post.save();

    return res.status(200).json({
      message: post.comments[commentIndex].isHidden 
        ? "Comment HIDDEN" 
        : "Comment UNHIDDEN",
      comment: post.comments[commentIndex]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  createPost, getAllPosts, getMyPosts, toggleLike, addComment,
  updatePost, deletePost,
  toggleLockPost, toggleHidePost, toggleCommentVisibility
};