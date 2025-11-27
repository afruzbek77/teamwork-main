const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require("../config/multer"); // import qilasan


exports.register = async (req, res) => {
  try {
    const { name, surname, username, email, password, role } = req.body;
    const file = req.file; // avatar file shu yerga tushadi

    // required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email va password majburiy!" });
    }

    // user exists check
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User exists" });

    // hash
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name: name || null,
      surname: surname || null,
      username,
      email,
      password: hashed,
      role: role || "user", // user o'zi yozadi
      avatar: file ? `/uploads/avatars/${file.filename}` : null // 📸 upload qilingan rasm saqlanadi
    });

    // JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
};