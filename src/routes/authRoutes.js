const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const upload = require("../config/multer");
// Register new user
// body: { name, surname, username, email, password, role }
// multipart/form-data: avatar
router.post("/register", upload.single("avatar"), register);

// Login user
// body: { email, password }
router.post('/login', login);
module.exports = router;