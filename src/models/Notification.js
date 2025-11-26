const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // assigned, comment, status-change, reply, updated, invite
    message: { type: String, required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);