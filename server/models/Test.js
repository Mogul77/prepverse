const mongoose = require("mongoose");

// =======================
// Question Schema
// =======================

const questionSchema = new mongoose.Schema({
  // Question Type
  type: {
    type: String,
    enum: ["mcq", "coding", "subjective", "fillblank"],
    default: "mcq",
  },

  // Question Text
  question: {
    type: String,
    required: true,
  },

  // MCQ Options
  options: {
    type: [String],
    default: [],
  },

  // Correct Answer
  correctAnswer: {
    type: String,
    required: true,
  },

  // Marks
  marks: {
    type: Number,
    default: 1,
  },

  // Difficulty
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  },

  // Topic
  topic: {
    type: String,
    default: "",
  },

  // Explanation
  explanation: {
    type: String,
    default: "",
  },
});

// =======================
// Test Schema
// =======================

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    questions: [questionSchema],

    createdBy: {
      type: String,
      default: "Admin",
    },
    testType: {
    type: String,
    enum: ["mcq", "coding"],
    default: "mcq"
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Test", testSchema);