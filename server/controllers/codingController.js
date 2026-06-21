const CodingQuestion = require('../models/CodingQuestion');

// 1. Create a coding question
exports.createCodingQuestion = async (req, res) => {
  try {
    const {
      testId,
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      explanation,
      starterCode,
      visibleTestCases,
      hiddenTestCases,
      timeLimit,
      memoryLimit
    } = req.body;

    const newQuestion = new CodingQuestion({
      testId,
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      explanation,
      starterCode,
      visibleTestCases,
      hiddenTestCases,
      timeLimit,
      memoryLimit
    });

    const savedQuestion = await newQuestion.save();
    return res.status(201).json(savedQuestion);
  } catch (error) {
    return res.status(500).json({ message: 'Server error while creating coding question', error: error.message });
  }
};

// 2. Get coding questions by test id (sorted newest first)
exports.getCodingQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const questions = await CodingQuestion.find({ testId }).sort({ createdAt: -1 });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'Server error while fetching coding questions', error: error.message });
  }
};

// 3. Update coding question by id
exports.updateCodingQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = await CodingQuestion.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Coding question not found' });
    }

    return res.status(200).json(updatedQuestion);
  } catch (error) {
    return res.status(500).json({ message: 'Server error while updating coding question', error: error.message });
  }
};

// 4. Delete coding question by id
exports.deleteCodingQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await CodingQuestion.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Coding question not found' });
    }

    return res.status(200).json({ message: 'Coding question deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while deleting coding question', error: error.message });
  }
};
