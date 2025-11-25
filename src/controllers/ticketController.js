const Ticket = require('../models/ticketModel');
const Project = require('../models/projectModel');
const ActivityLog = require('../models/activityLogModel');

exports.createTicket = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, priority, assignedTo } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const isUserAllowed =
            project.creator.toString() === req.user.id ||
            project.users.includes(req.user.id);

        if (!isUserAllowed)
            return res.status(403).json({ message: "You are not part of this project" });

        // Check assigned user is part of project
        if (assignedTo) {
            if (
                assignedTo !== project.creator.toString() &&
                !project.users.includes(assignedTo)
            ) {
                return res.status(400).json({ message: "Assigned user not in project" });
            }
        }

        const ticket = await Ticket.create({
            project: projectId,
            title,
            description,
            priority,
            assignedTo
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

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        // ============= LOG: STATUS CHANGED =============
        if (status && ticket.status !== status) {
            await ActivityLog.create({
                ticket: ticket._id,
                user: req.user._id,
                action: "Status changed",
                from: ticket.status,
                to: status
            });
            ticket.status = status;
        }

        // ============= LOG: ASSIGNED USER CHANGED =============
        if (assignedTo !== undefined) {
            if (ticket.assignedTo?.toString() !== assignedTo) {
                await ActivityLog.create({
                    ticket: ticket._id,
                    user: req.user._id,
                    action: "Assigned user changed",
                    from: ticket.assignedTo ? ticket.assignedTo.toString() : "Unassigned",
                    to: assignedTo || "Unassigned"
                });
                ticket.assignedTo = assignedTo || null;
            }
        }

        // Oddiy update (title, desc, priority)
        if (title) ticket.title = title;
        if (description) ticket.description = description;
        if (priority) ticket.priority = priority;

        await ticket.save();

        res.json(ticket);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTicketLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ ticket: req.params.id })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findByIdAndDelete(ticketId);

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.json({ message: "Ticket deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.addComment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ message: "Comment text required" });

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        ticket.comments.push({
            user: req.user.id,
            text
        });

        await ticket.save();

        res.json(ticket);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};