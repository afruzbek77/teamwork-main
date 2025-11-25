const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, deleteAccount } = require('../controllers/userController');

router.get('/me', auth, getProfile);        // Profilni olish
router.delete('/delete', auth, deleteAccount); // Akkountni o‘chirish

module.exports = router;