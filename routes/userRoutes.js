const express = require('express');
const { 
  register, login, getDetails,
  getAllUsers, toggleBlockUser, updateProfile
} = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/getDetails', authenticate, getDetails);

// ========== ADMIN ONLY — User Management ==========
router.get('/all', authenticate, isAdmin, getAllUsers);
router.patch('/:userId/block', authenticate, isAdmin, toggleBlockUser);
router.patch('/update', authenticate, updateProfile);

module.exports = router;