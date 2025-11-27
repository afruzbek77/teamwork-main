const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  surname: { type: String, default: "" },

  username: { 
    type: String, 
    required: true, 
    unique: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  password: {
    type: String,
    required: true
  },

  role: { 
    type: String, 
    default: "user"  // enum yo‘q, odam o‘zi yozadi
  },

  avatar: { type: String, default: null },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
