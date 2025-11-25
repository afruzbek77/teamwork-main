const mongoose = require('mongoose');
const crypto = require('crypto');

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  content: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },

  projectKey: { type: String, unique: true, required: true },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

collaborators: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: []
}],

  files: [FileSchema]

}, { timestamps: true });

ProjectSchema.pre("validate", function(next) {
  if (!this.projectKey) {
    this.projectKey = crypto.randomBytes(16).toString("hex");
  }
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);