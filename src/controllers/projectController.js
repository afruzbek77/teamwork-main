const Project = require('../models/Project');
const User = require('../models/User'); 
const Repo = require('../models/Repo'); // Agar repo ishlatilsa

// CREATE
exports.createProject = async (req, res) => {
  try {
    const { name, description, projectKey } = req.body;

    const project = await Project.create({
      name,
      description: description || "",
      projectKey: projectKey || "",  // model avtomatik generate qiladi
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
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    // Owner bo‘lgan projectlar
    const ownedProjects = await Project.find({ owner: userId })
      .select('name owner collaborators createdAt');

    // Collaborator bo‘lgan projectlar
    const sharedProjects = await Project.find({ collaborators: userId })
      .select('name owner collaborators createdAt');

    res.json({
      owned: ownedProjects,
      shared: sharedProjects
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ (GET PROJECT)
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner collaborators', 'username email');

    if (!project) return res.status(404).json({ message: 'Not found' });

    // Permission check
    const isOwner = project.owner._id.equals(req.user._id);
    const isCollaborator = project.collaborators.some(c => c._id.equals(req.user._id));

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateProject = async (req, res) => {
  try {
    const { name, description, projectKey } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Faqat egasi o'zgartira oladi
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Yangilanishlar
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (projectKey) project.projectKey = projectKey; // unique bo‘lgani uchun xatolik bo‘lishi mumkin

    await project.save();

    res.json({
      message: 'Project updated',
      project
    });
  } catch (error) {
    console.error(error);

    // projectKey duplicate bo‘lsa
    if (error.code === 11000) {
      return res.status(400).json({ message: 'projectKey already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // faqat project egasi team yaratishi mumkin
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    project.teams.push({ name, members: [] });
    await project.save();

    res.status(201).json({ message: "Team created", teams: project.teams });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addUserToTeam = async (req, res) => {
  try {
    const { projectId, teamId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const team = project.teams.id(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (!team.members.includes(userId)) {
      team.members.push(userId);
    }

    await project.save();

    res.json({ message: "User added to team", team });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.removeUserFromTeam = async (req, res) => {
  try {
    const { projectId, teamId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const team = project.teams.id(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members = team.members.filter(m => m.toString() !== userId);
    await project.save();

    res.json({ message: "User removed", team });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.renameTeam = async (req, res) => {
  try {
    const { projectId, teamId } = req.params;
    const { name } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const team = project.teams.id(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.name = name;
    await project.save();

    res.json({ message: "Team renamed", team });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { projectId, teamId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const team = project.teams.id(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.remove();
    await project.save();

    res.json({ message: "Team deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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

    // Remove repos/files owned by project
    await Repo.deleteMany({ project: req.params.id });

    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// INVITE
exports.inviteCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Not found' });

    // Permission → Only owner can invite
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Already collaborator?
    if (project.collaborators.includes(userId)) {
      return res.status(400).json({ message: 'User already collaborator' });
    }

    project.collaborators.push(userId);
    await project.save();

    const populated = await Project.findById(req.params.id)
      .populate('owner collaborators', 'username email');

    res.json(populated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};