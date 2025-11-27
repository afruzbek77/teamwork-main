const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, deleteAccount } = require('../controllers/userController');

// Get current user's profile
// headers: Authorization: Bearer <token>
router.get('/me', auth, getProfile);

// Delete current user's account
// headers: Authorization: Bearer <token>
router.delete('/delete', auth, deleteAccount);

module.exports = router;