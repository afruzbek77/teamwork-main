const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require('../middleware/authMiddleware');

// 🔥 userga tegishli notificatsiyalarni olish
router.get("/my", auth, async (req, res) => {
    try {
        const data = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 }); // eng yangilari tepada

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/read/:id", auth, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read" });
});

// 🔵 Barchasini read qilish
router.put("/read-all", auth, async (req, res) => {
    await Notification.updateMany({ user: req.user.id }, { read: true });
    res.json({ message: "All notifications marked read" });
});

module.exports = router;