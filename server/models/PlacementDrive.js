const mongoose = require("mongoose");

const placementDriveSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  ctc: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  eligibilityCriteria: {
    type: String,
    default: ""
  },
  eligibleBranches: {
    type: [String],
    default: []
  },
  minCgpa: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "published", "expired"],
    default: "published"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("PlacementDrive", placementDriveSchema);
