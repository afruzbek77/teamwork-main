const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require('../middleware/authMiddleware');

// Get current user's notifications
// returns: [ { user, title, body, read, createdAt } ]
router.get("/my", auth, async (req, res) => {
    try {
        const data = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 }); // eng yangilari tepada

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark a notification as read
// params: id
router.put("/read/:id", auth, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read" });
});

// Mark all notifications as read for current user
// returns: { message }
router.put("/read-all", auth, async (req, res) => {
    await Notification.updateMany({ user: req.user.id }, { read: true });
    res.json({ message: "All notifications marked read" });
});

module.exports = router;