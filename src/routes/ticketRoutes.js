const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const {
    createTicket,
    updateTicket,
    deleteTicket,
    addComment,
    getProjectTickets,
    getSingleTicket,
    getTicketLogs,
    updateComment,
    getComments,
    deleteComment,
    replyComment,
    editReply,
    deleteReply
} = require('../controllers/ticketController');

router.use(auth);
// Create ticket
// params: projectId
// body: { title, description, priority, assignedTo, status }
router.post('/:projectId', createTicket);

// Get all tickets for project
// params: projectId
router.get('/:projectId/all', getProjectTickets);

// Get single ticket
// params: ticketId
router.get('/single/:ticketId', getSingleTicket);

// Get ticket activity logs
// params: ticketId
router.get('/:ticketId/logs', getTicketLogs);

// Update ticket
// params: ticketId
// body: fields to update (status, assignedTo, title, etc.)
router.put('/:ticketId', updateTicket);

// Delete ticket
// params: ticketId
router.delete('/:ticketId', deleteTicket);

// Add comment to ticket
// params: ticketId
// body: { content }
router.post('/:ticketId/comment', addComment);

// Get comments for ticket
// params: ticketId
router.get('/:ticketId/comments', getComments);

// Update a comment
// params: ticketId, commentId
// body: { content }
router.put('/:ticketId/comment/:commentId', updateComment);

// Delete a comment
// params: ticketId, commentId
router.delete('/:ticketId/comment/:commentId', deleteComment);

// Reply to a comment
// params: ticketId, commentId
// body: { content }
router.post('/:ticketId/comment/:commentId/reply', replyComment);

// Edit a reply
// params: ticketId, commentId, replyId
// body: { content }
router.put('/:ticketId/comment/:commentId/reply/:replyId', editReply);

// Delete a reply
// params: ticketId, commentId, replyId
router.delete('/:ticketId/comment/:commentId/reply/:replyId', deleteReply);

module.exports = router;

