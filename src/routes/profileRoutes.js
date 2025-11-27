const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const upload = require('../middleware/upload');
const auth = require('../middleware/authMiddleware'); // 🔥 token tekshirish middleware

// Get current user's profile
// headers: Authorization: Bearer <token>
router.get('/me', auth, getProfile);

// Update profile (fields + avatar)
// body: { name, surname, role }
// multipart/form-data: avatar
router.put('/settings', auth, upload.single("avatar"), updateProfile);

// Change password
// body: { oldPassword, newPassword }
// Note: requires authentication
router.put('/change-password', changePassword);
module.exports = router;