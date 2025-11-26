const mongoose = require('mongoose');

// 🔻 Reply Schema (nested)
const ReplySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    edited: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});


// 🔻 Comment Schema (endi replies ham bor)
const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    edited: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now },

    // 🚀 Replies array qo‘shildi!!!!
    replies: [ReplySchema]
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