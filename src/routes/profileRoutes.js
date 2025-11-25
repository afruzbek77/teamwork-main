const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

router.get('/me', auth, profileController.getMyProfile);
router.put('/me', auth, profileController.updateMyProfile);

module.exports = router;