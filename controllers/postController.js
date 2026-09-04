const Post = require('../models/Post');

// ✅ Create Post
const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const post = await Post.create({
      content,
      imageUrl: imageUrl || null,
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
      posts = await Post.find().sort({ createdAt: -1 });
    } else {
      const allPosts = await Post.find({ isHidden: false }).sort({ createdAt: -1 });
      posts = allPosts.map(post => {
        post = post.toObject();
        post.comments = post.comments.filter(c => !c.isHidden);
        return post;
      });
    }
    return res.status(200).json({ posts });
  } catch (err) {
    return res.status(200).json({ posts: [] });
  }
};

// ✅ Get SINGLE Post by ID — RETURNS 200 NOT 404!
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    // ✅ Post NOT found → return 200 with null, NOT 404!
    if (!post) {
      return res.status(200).json({ post: null, message: 'Post not found' });
    }
    
    // ✅ Post is HIDDEN & user is NOT admin → return 200 with null
    if (post.isHidden && !req.user?.isAdmin) {
      return res.status(200).json({ post: null, message: 'Post unavailable' });
    }
    
    // ✅ Filter hidden comments for regular users
    if (!req.user?.isAdmin) {
      post.comments = post.comments.filter(c => !c.isHidden);
    }
    
    return res.status(200).json({ post });
  } catch (err) {
    return res.status(200).json({ post: null, error: err.message });
  }
};

// ✅ Get My Posts
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ posts });
  } catch (err) {
    return res.status(200).json({ posts: [] });
  }
};

// ✅ Like / Unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(200).json({ error: "Post not found", post: null });
    }
    if (post.isHidden && !req.user?.isAdmin) {
      return res.status(200).json({ error: "Post unavailable", post: null });
    }
    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    return res.status(200).json({ message: hasLiked ? "Unliked" : "Liked", post });
  } catch (err) {
    return res.status(200).json({ error: err.message, post: null });
  }
};

// ✅ Add Comment — ANY logged-in user
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(200).json({ error: "Post not found" });
    }
    if (post.isHidden && !req.user?.isAdmin) {
      return res.status(200).json({ error: "Post unavailable" });
    }
    if (post.isLocked) {
      return res.status(200).json({ error: "Comments are locked for this post" });
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
    return res.status(200).json({ error: err.message });
  }
};

// ✅ Update Post — ONLY OWNER
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(200).json({ error: "Post not found" });
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(200).json({ error: "You can only update your own posts" });
    }
    post.content = req.body.content || post.content;
    if (req.body.imageUrl !== undefined) {
      post.imageUrl = req.body.imageUrl;
    }
    await post.save();
    return res.status(200).json({ message: "Post updated successfully", post });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
};

// ✅ Delete Post — ONLY OWNER
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(200).json({ error: "Post not found" });
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(200).json({ error: "You can only delete your own posts" });
    }
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
};

// ✅ Admin: Lock/Unlock Post Comments
const toggleLockPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(200).json({ error: "Post not found" });
    }
    post.isLocked = !post.isLocked;
    await post.save();
    return res.status(200).json({ 
      message: post.isLocked ? "Post comments LOCKED" : "Post comments UNLOCKED",
      isLocked: post.isLocked
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
};

// ✅ Admin: Hide/Unhide Post
const toggleHidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(200).json({ error: "Post not found" });
    }
    post.isHidden = !post.isHidden;
    await post.save();
    return res.status(200).json({ 
      message: post.isHidden ? "Post HIDDEN from public" : "Post VISIBLE to public",
      isHidden: post.isHidden
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
};

// ✅ ADMIN: Hide/Unhide a SPECIFIC Comment
const toggleCommentVisibility = async (req, res) => {
  try {
    const { postId, commentIndex } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (!post.comments[commentIndex]) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // ✅ TOGGLE the isHidden value (FLIP IT!)
    post.comments[commentIndex].isHidden = !post.comments[commentIndex].isHidden;
    
    await post.save(); // ✅ SAVE to database!

    return res.status(200).json({ 
      message: post.comments[commentIndex].isHidden ? "Comment hidden" : "Comment unhidden",
      isHidden: post.comments[commentIndex].isHidden,
      comment: post.comments[commentIndex]
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = { 
  createPost, 
  getAllPosts, 
  getPostById,   // ✅ NEW: Added!
  getMyPosts,
  toggleLike, 
  addComment,
  updatePost, 
  deletePost,
  toggleLockPost, 
  toggleHidePost, 
  toggleCommentVisibility
};