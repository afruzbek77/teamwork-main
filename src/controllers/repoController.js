const Repo = require('../models/Repo');
const io = require('../../server'); // server.js dan io import qilinadi

exports.addFile = async (req, res) => {
  const { filename, content } = req.body;
  let repo = await Repo.findOne({ project: req.params.projectId });
  if (!repo) repo = await Repo.create({ project: req.params.projectId, files: [] });

  repo.files.push({ filename, content });
  await repo.save();

  // Socket.io emit qilish
  io.to(req.params.projectId).emit('fileUpdated', { filename, content });

  res.json(repo.files);
};

exports.updateFile = async (req, res) => {
  const { filename, content } = req.body;
  const repo = await Repo.findOne({ project: req.params.projectId });
  if (!repo) return res.status(404).json({ message: 'Repo not found' });

  const file = repo.files.find(f => f.filename === filename);
  if (!file) return res.status(404).json({ message: 'File not found' });

  file.content = content;
  file.updatedAt = Date.now();
  await repo.save();

  // Socket.io emit qilish
  io.to(req.params.projectId).emit('fileUpdated', { filename, content });

  res.json(file);
};

exports.deleteFile = async (req, res) => {
  const { filename } = req.body;
  const repo = await Repo.findOne({ project: req.params.projectId });

  if (!repo) return res.status(404).json({ message: 'Repo not found' });

  const fileIndex = repo.files.findIndex(f => f.filename === filename);
  if (fileIndex === -1) {
    return res.status(404).json({ message: 'File not found' });
  }

  // O‘chiramiz
  repo.files.splice(fileIndex, 1);
  await repo.save();

  // Socket emit — boshqalarga ham file o‘chirilgani haqida xabar
  io.to(req.params.projectId).emit('fileDeleted', { filename });

  res.json({ message: 'File deleted successfully' });
};

exports.listFiles = async (req, res) => {
  const repo = await Repo.findOne({ project: req.params.projectId });
  if (!repo) return res.status(404).json({ message: 'Repo not found' });

  res.json(repo.files);
};