const mongoose = require('mongoose');

const codingQuestionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  constraints: {
    type: String
  },
  inputFormat: {
    type: String
  },
  outputFormat: {
    type: String
  },
  sampleInput: {
    type: String
  },
  sampleOutput: {
    type: String
  },
  explanation: {
    type: String
  },
  starterCode: {
    java: {
      type: String,
      default: ''
    },
    python: {
      type: String,
      default: ''
    },
    cpp: {
      type: String,
      default: ''
    },
    javascript: {
      type: String,
      default: ''
    }
  },
  visibleTestCases: [
    {
      input: {
        type: String
      },
      output: {
        type: String
      }
    }
  ],
  hiddenTestCases: [
    {
      input: {
        type: String
      },
      output: {
        type: String
      }
    }
  ],
  timeLimit: {
    type: Number,
    default: 1
  },
  memoryLimit: {
    type: Number,
    default: 256
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
