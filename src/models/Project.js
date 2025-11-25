const mongoose = require('mongoose');
const crypto = require('crypto');

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  content: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

// TEAM SCHEMA
const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
    trim: true
  },

  projectKey: {
    type: String,
    unique: true,
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  teams: [TeamSchema],  // ✅ TEAMLAR QO‘SHILDI!

  files: [FileSchema]

}, { timestamps: true });


// Auto-generate projectKey
ProjectSchema.pre("validate", function (next) {
  if (!this.projectKey || this.projectKey.trim() === "") {
    this.projectKey = crypto.randomBytes(16).toString("hex");
  }
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);