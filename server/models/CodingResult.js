const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion',
    required: true
  },
  language: {
    type: String,
    default: ''
  },
  sourceCode: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memory: {
    type: Number,
    default: 0
  },
  attempted: {
    type: Boolean,
    default: false
  }
});

const codingResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [answerSchema],
  totalQuestions: {
    type: Number,
    required: true
  },
  attemptedQuestions: {
    type: Number,
    required: true
  },
  unattemptedQuestions: {
    type: Number,
    required: true
  },
  totalScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passedQuestions: {
    type: Number,
    required: true
  },
  failedQuestions: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CodingResult', codingResultSchema);
