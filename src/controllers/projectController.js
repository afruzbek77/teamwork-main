const Project = require('../models/Project');
const User = require('../models/User');
const Repo = require('../models/Repo');

// CREATE
exports.createProject = async (req, res) => {
  try {
    const { name, description, projectKey } = req.body;

    const project = await Project.create({
      name,
      description: description || "",
      projectKey,
      owner: req.user._id,
      collaborators: [],
      files: []
    });

    res.status(201).json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET USER PROJECTS
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const owned = await Project.find({ owner: userId })
      .select('name description projectKey collaborators createdAt');

    const shared = await Project.find({ collaborators: userId })
      .select('name description projectKey collaborators createdAt');

    res.json({ owned, shared });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET PROJECT
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email');

    if (!project) return res.status(404).json({ message: 'Not found' });

    const userId = req.user._id;

    if (!project.owner.equals(userId) && 
        !project.collaborators.some(c => c.equals(userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const { name, description, projectKey } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (projectKey) project.projectKey = projectKey;

    await project.save();

    res.json({ message: "Updated", project });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "projectKey already exists" });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Repo.deleteMany({ project: req.params.id });
    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project deleted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// INVITE USER
exports.inviteCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!Array.isArray(project.collaborators)) {
      project.collaborators = [];
    }

    if (!project.collaborators.includes(userId)) {
      project.collaborators.push(userId);
    }

    await project.save();

    const updated = await Project.findById(req.params.id)
      .populate('owner collaborators', 'username email');

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// REMOVE USER
exports.removeUser = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ message: 'Not found' });

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    project.collaborators = project.collaborators.filter(
      (c) => c.toString() !== userId
    );

    await project.save();

    res.json({ message: 'User removed' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// LEAVE PROJECT
exports.leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Not found' });

    project.collaborators = project.collaborators.filter(
      (c) => c.toString() !== req.user._id.toString()
    );

    await project.save();

    res.json({ message: 'Left project' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};