const Result = require("../models/result");
const Test = require("../models/Test");
// SAVE RESULT
const saveResult = async (req, res) => {
  try {
    const { userId, testId, score, total } = req.body;

    const result = await Result.create({
      userId,
      testId,
      score,
      total,
    });

    res.status(201).json({
      message: "Result saved successfully",
      result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET USER RESULTS
const getResults = async (req, res) => {
    try {
      const results = await Result.find({ userId: req.params.userId });
  
      const enrichedResults = await Promise.all(
        results.map(async (r) => {
          const test = await Test.findById(r.testId);
  
          return {
            _id: r._id,
            score: r.score,
            total: r.total,
            createdAt: r.createdAt,
            testName: test ? test.title : "Deleted Test",
          };
        })
      );
  
      res.status(200).json(enrichedResults);
    } catch (error) {
      console.log(error);
  
      res.status(500).json({
        message: "Server Error",
      });
    }
  };

module.exports = {
  saveResult,
  getResults,
};