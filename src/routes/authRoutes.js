const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const upload = require("../config/multer");
router.post("/register", upload.single("avatar"), register);
router.post('/login', login);
module.exports = router;