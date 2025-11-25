const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low"
    },

    status: {
        type: String,
        enum: ["todo", "in-progress", "review", "done"],
        default: "todo"
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    comments: [CommentSchema]

}, { timestamps: true });

module.exports = mongoose.model("Ticket", TicketSchema);