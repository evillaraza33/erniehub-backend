const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ REGISTER — Status defaults to "pending" (waits approval!)
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ✅ INSTANTLY ACTIVE — NO PENDING STATUS!
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashedPassword
    });

    const { password: _, ...userData } = newUser._doc;
    return res.status(201).json({ 
      message: "Account created successfully! You can now login.", 
      user: userData 
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ✅ LOGIN — should work instantly withou admin's approval
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🚫 ONLY check if BLOCKED — NO PENDING/DENIED check!
    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userData } = user._doc;
    return res.status(200).json({ message: "Login successful", token, user: userData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ========== ADMIN ONLY FEATURES ==========

// ✅ Get ALL PENDING join requests
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ pendingUsers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Admin APPROVES or DENIES a user
const handleJoinRequest = async (req, res) => {
  try {
    const { userId, action } = req.params; // action = "approve" or "deny"
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (action === 'approve') {
      user.status = 'active';
      await user.save();
      return res.status(200).json({ message: "User approved! Can now login." });
    } 
    else if (action === 'deny') {
      user.status = 'denied';
      await user.save();
      return res.status(200).json({ message: "User registration denied." });
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Admin BLOCKs a user
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Cannot block yourself!
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();
    return res.status(200).json({ 
      message: user.isBlocked ? "User blocked" : "User unblocked",
      isBlocked: user.isBlocked
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Admin gets ALL users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  register, login, getDetails,
  getAllUsers, toggleBlockUser  // ✅ Admin can still block/unblock
};