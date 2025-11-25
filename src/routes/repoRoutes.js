const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

router.post('/:projectId/file/add', repoController.addFile);
router.put('/:projectId/file/update', repoController.updateFile);
router.get('/:projectId/files', repoController.listFiles);

// DELETE file
router.delete('/:projectId/file/delete', repoController.deleteFile);

module.exports = router;