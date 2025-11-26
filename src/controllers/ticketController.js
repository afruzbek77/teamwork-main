const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const getProjectUsers = require("../utils/getProjectUsers");
const sendNotification = require("../utils/sendNotification");
const notify = require("../utils/sendNotification");

exports.createTicket = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, priority, assignedTo } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const isUserAllowed =
            project.owner.toString() === req.user.id ||
            project.collaborators.includes(req.user.id);

        if (!isUserAllowed)
            return res.status(403).json({ message: "You are not part of this project" });

        if (assignedTo) {
            if (
                assignedTo !== project.owner.toString() &&
                !project.collaborators.includes(assignedTo)
            ) {
                return res.status(400).json({ message: "Assigned user not in project" });
            }
        }

        const ticket = await Ticket.create({
            project: projectId,
            title,
            description,
            priority: priority || "low",
            assignedTo: assignedTo || null
        });

        // 🟢 NOTIFICATION — yangi ticket ochilganda barcha project a'zolariga boradi
        await sendNotification({
            users: [
                project.owner.toString(),
                ...project.collaborators.map(id => id.toString())
            ],
            type: "ticket-created",
            message: `New ticket created: ${title}`,
            project: projectId,
            ticket: ticket._id
        });

        res.status(201).json(ticket);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getProjectTickets = async (req, res) => {
    try {
        const { projectId } = req.params;

        const tickets = await Ticket.find({ project: projectId })
            .populate("assignedTo", "name email")
            .populate("comments.user", "name email");

        res.json(tickets);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSingleTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId)
            .populate("assignedTo", "name email")
            .populate("comments.user", "name email");

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.json(ticket);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { title, description, priority, status, assignedTo } = req.body;

        const ticket = await Ticket.findById(ticketId).populate("project");
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const project = ticket.project;
        const notifyUsers = [
            project.owner.toString(), 
            ...project.collaborators.map(id => id.toString())
        ];

        // 🟡 STATUS o‘zgargan bo‘lsa NOTIFICATION
        if (status && ticket.status !== status) {
            await sendNotification({
                users: notifyUsers,
                type: "status-change",
                message: `Ticket status: ${ticket.title} → ${status}`,
                project: project._id,
                ticket: ticket._id
            });
            ticket.status = status;
        }

        // 🟡 Yangi assignee bo‘lsa
        if (assignedTo && ticket.assignedTo?.toString() !== assignedTo) {
            await sendNotification({
                users: notifyUsers,
                type: "assigned",
                message: `Ticket assigned updated: ${ticket.title}`,
                project: project._id,
                ticket: ticket._id
            });
            ticket.assignedTo = assignedTo;
        }

        if (title) ticket.title = title;
        if (description) ticket.description = description;
        if (priority) ticket.priority = priority;

        await ticket.save();
        return res.json(ticket);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getTicketLogs = async (req, res) => {
    try {
        const ticketId = req.params.ticketId; // ✔ paramsdan id olamiz
        
        const logs = await ActivityLog.find({ ticket: ticketId })
            .populate("user", "username email")
            .sort({ createdAt: 1 });  // vaqt bo‘yicha ketma-ket
        
        res.json(logs);

    } catch (err) {
        console.error("GET LOGS ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        // ❗ oldin ticketni topamiz (o‘chirmasdan)
        const ticket = await Ticket.findById(ticketId).populate("project");

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const project = ticket.project;

        const users = [
            project.owner.toString(),
            ...project.collaborators.map(id => id.toString())
        ];

        // 🟡 NOTIFICATION — ticket o‘chirilganda hamma biladi
        await sendNotification({
            users,
            type: "ticket-deleted",
            message: `Ticket deleted: ${ticket.title}`,
            project: project._id,
            ticket: ticket._id
        });

        // 🔴 keyin o‘chiramiz
        await Ticket.findByIdAndDelete(ticketId);

        res.json({ message: "Ticket deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId)
            .populate("comments.user", "username email") // comment yozgan user haqida
            .select("comments"); // faqat commentlar qaytsin

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.json(ticket.comments);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    const { ticketId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Comment text required" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.comments.push({ user: req.user.id, text });
    await ticket.save();

    const users = await getProjectUsers(ticket.project);

    // 🔥 barcha userlarga yozib chiqamiz
    for (let u of users) {
        if (u !== req.user.id)  // o‘zi yozgan odamga qaytarib yubormaymiz
            await notify(u, "comment", `${req.user.username} left a comment`, ticketId, ticket.project);
    }

    res.json({ message: "Comment added" });
};

exports.updateComment = async (req, res) => {
    try {
        const { ticketId, commentId } = req.params;
        const { text } = req.body;

        const ticket = await Ticket.findById(ticketId).populate("project");
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const comment = ticket.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // ❗ faqat comment egasi edit qilsin
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can update only your own comments" });
        }

        const oldText = comment.text;
        comment.text = text;
        comment.edited = true;
        await ticket.save();

        // 📓 Activity Log
        await ActivityLog.create({
            ticket: ticketId,
            user: req.user.id,
            action: "Comment edited",
            from: oldText,
            to: text
        });

        // 🔔 Notification
        const users = [
            ticket.project.owner.toString(),
            ...ticket.project.collaborators.map(id => id.toString())
        ].filter(u => u !== req.user.id); // O‘zi edit qilgan odamga yubormaymiz

        await sendNotification({
            users,
            type: "comment-edited",
            message: `Comment edited in ticket: ${ticket.title}`,
            project: ticket.project._id,
            ticket: ticket._id
        });

        return res.json({ message: "Comment updated", comment });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { ticketId, commentId } = req.params;

        const ticket = await Ticket.findById(ticketId).populate("project");
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const project = await Project.findById(ticket.project);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const comment = ticket.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const isOwner = project.owner.toString() === req.user.id; 
        const isAuthor = comment.user.toString() === req.user.id; 

        if (!isOwner && !isAuthor) {
            return res.status(403).json({ 
                message: "You cannot delete this comment (Not owner or comment author)" 
            });
        }

        // 🔴 Commentni o'chiramiz
        comment.deleteOne();
        await ticket.save();

        // 📣 NOTIFICATION — comment deleted
        const users = [
            project.owner.toString(),
            ...project.collaborators.map(id => id.toString())
        ];

        await sendNotification({
            users,
            type: "comment-deleted",
            message: `Comment removed from ticket: ${ticket.title}`,
            project: project._id,
            ticket: ticket._id
        });

        return res.json({ message: "Comment deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.replyComment = async (req, res) => {
    const { ticketId, commentId } = req.params;
    const { text } = req.body;

    const ticket = await Ticket.findById(ticketId);
    const comment = ticket.comments.id(commentId);

    comment.replies.push({ user: req.user.id, text });
    await ticket.save();

    const users = await getProjectUsers(ticket.project);

    for (let u of users)
        if (u !== req.user.id)
            await notify(u, "reply", `${req.user.username} replied in ticket`, ticketId, ticket.project);

    res.json({ message: "Reply added" });
};



exports.deleteReply = async (req, res) => {
    try {
        const { ticketId, commentId, replyId } = req.params;

        const ticket = await Ticket.findById(ticketId).populate("project");
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const comment = ticket.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found" });

        const project = ticket.project;

        const isOwner = project.owner.toString() === req.user.id;
        const isAuthor = reply.user.toString() === req.user.id;

        if (!isOwner && !isAuthor) {
            return res.status(403).json({ message: "You cannot delete this reply" });
        }

        // ❌ Reply o'chadi
        reply.deleteOne();
        await ticket.save();

        // 🔔 Notification for all users in project
        const notifyUsers = [
            project.owner.toString(),
            ...project.collaborators.map(id => id.toString())
        ];

        await sendNotification({
            users: notifyUsers,
            type: "reply-deleted",
            message: `Reply removed in ticket: ${ticket.title}`,
            ticket: ticket._id,
            project: project._id
        });

        return res.json({ message: "Reply deleted" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.editReply = async (req, res) => {
    try {
        const { ticketId, commentId, replyId } = req.params;
        const { text } = req.body;

        const ticket = await Ticket.findById(ticketId).populate("project");
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const comment = ticket.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // 🔥 replyni topish
        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found" });

        // faqat reply muallifi edit qilsin
        if (reply.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can edit only your own reply" });
        }

        reply.text = text;
        reply.edited = true;
        await ticket.save();

        // 📢 Notification uchun userlarni tayyorlaymiz
        const notifyUsers = [
            ticket.project.owner.toString(),
            ...ticket.project.collaborators.map(id => id.toString())
        ];

        // 🔔 Reply "edit" bo‘lganda notification
        await sendNotification({
            users: notifyUsers,
            type: "reply-edited",
            message: `Reply updated in ticket: ${ticket.title}`,
            project: ticket.project._id,
            ticket: ticket._id
        });

        return res.json({ message: "Reply updated", reply });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};