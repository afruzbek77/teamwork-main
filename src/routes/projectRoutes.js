const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const {
  createProject,
  getProject,
  getUserProjects,
  inviteCollaborator,
  updateProject,
  deleteProject,
    createTeam,
  addUserToTeam,
  removeUserFromTeam,
  renameTeam,
  deleteTeam
} = require('../controllers/projectController');

// Token required
router.use(auth);

// 📌 GET all user projects
router.get('/all', getUserProjects);

// 📌 CREATE project
router.post('/create', createProject);
router.put('/:id', updateProject);
// 📌 INVITE collaborator
router.post('/:id/collaborators', inviteCollaborator);
router.post('/:projectId/teams', createTeam);
router.post('/:projectId/teams/:teamId/members', addUserToTeam);
router.delete('/:projectId/teams/:teamId/members/:userId', removeUserFromTeam);
router.put('/:projectId/teams/:teamId', renameTeam);
router.delete('/:projectId/teams/:teamId', deleteTeam);
// 📌 GET single project
router.get('/:id', getProject);

// 📌 DELETE project
router.delete('/:id', deleteProject);

module.exports = router;