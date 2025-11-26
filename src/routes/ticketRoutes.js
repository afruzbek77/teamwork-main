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
router.post('/:projectId', createTicket);

// Get all tickets for project
router.get('/:projectId/all', getProjectTickets);

// Get single ticket
router.get('/single/:ticketId', getSingleTicket);

// ⬇️ Yangi qo‘shilgan route — Activity Log olish
router.get('/:ticketId/logs', getTicketLogs);

// Update ticket (status, assignedTo, title, etc.)
router.put('/:ticketId', updateTicket);

// Delete ticket
router.delete('/:ticketId', deleteTicket);


// Add comment
router.post('/:ticketId/comment', addComment);

// get comment
router.get('/:ticketId/comments', getComments);

// Update comment
router.put('/:ticketId/comment/:commentId', updateComment);
// Delete comment
router.delete('/:ticketId/comment/:commentId', deleteComment);


// COMMENT → REPLY
router.post('/:ticketId/comment/:commentId/reply', replyComment);

// EDIT REPLY
router.put('/:ticketId/comment/:commentId/reply/:replyId', editReply);

// DELETE REPLY
router.delete('/:ticketId/comment/:commentId/reply/:replyId', deleteReply);

module.exports = router;

