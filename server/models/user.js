const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["student", "admin", "superadmin"],
    default: "student",
  },

  subscriptionType: {
    type: String,
    enum: ["free", "premium", "college"],
    default: "free",
  },
});

module.exports = mongoose.model("User", userSchema);