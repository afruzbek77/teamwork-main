const Project = require("../models/Project");

module.exports = async function getProjectUsers(projectId) {
    const project = await Project.findById(projectId);
    return [
        project.owner.toString(),
        ...project.collaborators.map(c => c.toString())
    ];
};