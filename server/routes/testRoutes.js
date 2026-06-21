const express = require("express");

const router = express.Router();

const {
  createTest,
  getTests,
  getTestById,
  deleteTest,
  addQuestion,
  deleteQuestion,
  updateQuestion,
} = require("../controllers/testController");

router.post("/", createTest);

router.get("/", getTests);

router.get("/:id", getTestById);

router.delete("/:id", deleteTest);

router.post("/:id/question", addQuestion);

router.delete("/:testId/question/:questionId", deleteQuestion);
router.put("/:testId/question/:questionId", updateQuestion);

module.exports = router;