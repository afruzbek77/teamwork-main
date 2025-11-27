const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteCollaborator,
  getProjectUsers,
  removeUser,
  leaveProject
} = require('../controllers/projectController');

// All routes require auth
router.use(auth);

// Get all projects (owned + shared)
router.get('/all', getUserProjects);

// Create new project
router.post('/create', createProject);

// Update project (only owner)
router.put('/:id', updateProject);

// Add collaborator
router.post('/:id/collaborators', inviteCollaborator);

// project users
router.get('/:id/users', getProjectUsers);
// Remove collaborator
router.delete('/:id/collaborators/:userId', removeUser);

// User leaves project
router.post('/:id/leave', leaveProject);

// Get single project
router.get('/:id', getProject);

// Delete project (only owner) → MUST BE LAST
router.delete('/:id', deleteProject);


module.exports = router;