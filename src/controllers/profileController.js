const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("username role avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
        message: "Your profile",
        user
    });
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, surname, role } = req.body;

    // update simple fields
    if (name !== undefined) user.name = name;
    if (surname !== undefined) user.surname = surname;
    if (role !== undefined) user.role = role;

    // Agar yangi avatar yuklangan bo‘lsa → eski rasmni o‘chiramiz
    if (req.file) {
      const oldAvatar = user.avatar; // eski rasm yo‘li
      user.avatar = "/uploads/avatars/" + req.file.filename; // yangi rasm

      // 📌 eski rasmni diskdan o‘chirish
      if (oldAvatar) {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(__dirname, "../../", oldAvatar);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};