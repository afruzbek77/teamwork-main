const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

// Add file to project repo
// params: projectId
// body: { filename, content }
router.post('/:projectId/file/add', repoController.addFile);

// Update existing file
// params: projectId
// body: { filename, content }
router.put('/:projectId/file/update', repoController.updateFile);

// List files in project repo
// params: projectId
router.get('/:projectId/files', repoController.listFiles);

// Delete file from repo
// params: projectId
// body: { filename }
router.delete('/:projectId/file/delete', repoController.deleteFile);

module.exports = router;