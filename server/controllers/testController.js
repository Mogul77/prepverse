const Test = require("../models/Test");

// CREATE TEST
const createTest = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const {
      title,
      description,
      category,
      duration,
      questions,
      testType,
    } = req.body;

    const test = await Test.create({
      title,
      description,
      category,
      duration,
      questions,
      testType,
    });
    console.log("Saved Test:", test);

    res.status(201).json({
      message: "Test Created Successfully",
      test,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET ALL TESTS
const getTests = async (req, res) => {
  try {
    const tests = await Test.find();

    res.status(200).json(tests);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET TEST BY ID
const getTestById = async (req, res) => {
  try {
    console.log("Requested ID:", req.params.id);

    const test = await Test.findById(req.params.id);

    console.log("Found Test:", test);

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    res.status(200).json(test);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// DELETE TEST
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(
      req.params.id
    );

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    res.status(200).json({
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ADD QUESTION TO TEST
const addQuestion = async (req, res) => {
  try {
    const {
  type,
  question,
  options,
  correctAnswer,
  marks,
  difficulty,
  topic,
  explanation,
} = req.body;

    const test = await Test.findById(
      req.params.id
    );

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    test.questions.push({
        type,
  question,
  options,
  correctAnswer,
  marks,
  difficulty,
  topic,
  explanation,
    });

    await test.save();

    res.status(200).json({
      message: "Question added successfully",
      test,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// DELETE QUESTION FROM TEST
const deleteQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.params;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    test.questions = test.questions.filter(
      (q) => q._id.toString() !== questionId
    );

    await test.save();

    res.status(200).json({
      message: "Question deleted successfully",
      test,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
// UPDATE QUESTION
const updateQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.params;

    const {
        type,
  question,
  options,
  correctAnswer,
  marks,
  difficulty,
  topic,
  explanation,
    } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    const existingQuestion = test.questions.id(questionId);

    if (!existingQuestion) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    existingQuestion.type = type;
existingQuestion.question = question;
existingQuestion.options = options;
existingQuestion.correctAnswer = correctAnswer;
existingQuestion.marks = marks;
existingQuestion.difficulty = difficulty;
existingQuestion.topic = topic;
existingQuestion.explanation = explanation;

    await test.save();

    res.status(200).json({
      message: "Question updated successfully",
      test,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createTest,
  getTests,
  getTestById,
  deleteTest,
  addQuestion,
  deleteQuestion,
  updateQuestion,
};