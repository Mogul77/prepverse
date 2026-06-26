const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  website: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: "company"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Company", companySchema);
