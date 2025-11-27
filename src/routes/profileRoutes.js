const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const upload = require('../middleware/upload');
const auth = require('../middleware/authMiddleware'); // 🔥 token tekshirish middleware


router.get('/me', auth, getProfile);  // Token bo‘lsa profil olish
router.put('/settings', auth, upload.single("avatar"), updateProfile); // Profil update + rasm yuklash
router.put('/change-password', changePassword);  
module.exports = router;