const CodingResult = require('../models/CodingResult');
const User = require('../models/user');
const Test = require('../models/Test');

// Save or update coding result
const saveCodingResult = async (req, res) => {
  try {
    const {
      studentId,
      testId,
      answers
    } = req.body;

    // Get user details
    const student = await User.findById(studentId);
    const studentName = student ? student.name : "Student";

    // Get test details to calculate metrics
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Calculate metrics
    const totalQuestions = answers.length;
    let attemptedQuestions = 0;
    let unattemptedQuestions = 0;
    let totalScore = 0;
    let passedQuestions = 0;
    let failedQuestions = 0;

    answers.forEach(ans => {
      if (ans.attempted) {
        attemptedQuestions++;
        totalScore += ans.score || 0;
        
        // A question is considered passed if passedTestCases equals totalTestCases and totalTestCases > 0
        if (ans.passedTestCases === ans.totalTestCases && ans.totalTestCases > 0) {
          passedQuestions++;
        } else {
          failedQuestions++;
        }
      } else {
        unattemptedQuestions++;
        failedQuestions++; // unattempted questions count as failed questions
      }
    });

    // Percentage of total test cases passed across all questions
    const totalTestCases = answers.reduce((sum, ans) => sum + (ans.totalTestCases || 0), 0);
    const totalPassedTestCases = answers.reduce((sum, ans) => sum + (ans.passedTestCases || 0), 0);
    const percentage = totalTestCases > 0 ? (totalPassedTestCases / totalTestCases) * 100 : 0;

    // Check for duplicate submission (same student and test)
    let codingResult = await CodingResult.findOne({ studentId, testId });

    if (codingResult) {
      // Update existing result to avoid duplicate
      codingResult.studentName = studentName;
      codingResult.answers = answers;
      codingResult.totalQuestions = totalQuestions;
      codingResult.attemptedQuestions = attemptedQuestions;
      codingResult.unattemptedQuestions = unattemptedQuestions;
      codingResult.totalScore = totalScore;
      codingResult.percentage = percentage;
      codingResult.passedQuestions = passedQuestions;
      codingResult.failedQuestions = failedQuestions;
      codingResult.submittedAt = Date.now();

      await codingResult.save();
      return res.status(200).json({
        message: "Submission Saved Successfully",
        result: codingResult
      });
    }

    // Create new result if none exists
    codingResult = new CodingResult({
      studentId,
      studentName,
      testId,
      answers,
      totalQuestions,
      attemptedQuestions,
      unattemptedQuestions,
      totalScore,
      percentage,
      passedQuestions,
      failedQuestions,
      submittedAt: Date.now()
    });

    const savedResult = await codingResult.save();
    return res.status(201).json({
      message: "Submission Saved Successfully",
      result: savedResult
    });
  } catch (error) {
    console.error("Error in saveCodingResult:", error);
    return res.status(500).json({
      message: "Server error while saving coding result",
      error: error.message
    });
  }
};

// Get coding results for a specific student
const getStudentCodingResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await CodingResult.find({ studentId })
      .populate('testId', 'title duration')
      .sort({ submittedAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in getStudentCodingResults:", error);
    return res.status(500).json({
      message: "Server error while fetching student coding results",
      error: error.message
    });
  }
};

// Get coding results for a specific test
const getCodingResultByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const results = await CodingResult.find({ testId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in getCodingResultByTest:", error);
    return res.status(500).json({
      message: "Server error while fetching coding results by test",
      error: error.message
    });
  }
};

// Get a single coding result by ID
const getCodingResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CodingResult.findById(id)
      .populate({
        path: 'answers.questionId',
        select: 'title description inputFormat outputFormat sampleInput sampleOutput difficulty'
      })
      .populate('testId', 'title duration')
      .populate('studentId', 'name email');

    if (!result) {
      return res.status(404).json({ message: "Coding result not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCodingResult:", error);
    return res.status(500).json({
      message: "Server error while fetching coding result",
      error: error.message
    });
  }
};

// Delete a coding result by ID
const deleteCodingResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedResult = await CodingResult.findByIdAndDelete(id);

    if (!deletedResult) {
      return res.status(404).json({ message: "Coding result not found" });
    }

    return res.status(200).json({ message: "Coding result deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCodingResult:", error);
    return res.status(500).json({
      message: "Server error while deleting coding result",
      error: error.message
    });
  }
};

module.exports = {
  saveCodingResult,
  getStudentCodingResults,
  getCodingResultByTest,
  getCodingResult,
  deleteCodingResult
};
