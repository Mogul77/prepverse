const express = require('express');
const router = express.Router();
const {
  saveCodingResult,
  getStudentCodingResults,
  getCodingResultByTest,
  getCodingResult,
  deleteCodingResult
} = require('../controllers/codingResultController');

// POST /api/coding-results -> Save coding result
router.post('/', saveCodingResult);

// GET /api/coding-results/student/:studentId -> Get results by student ID
router.get('/student/:studentId', getStudentCodingResults);

// GET /api/coding-results/test/:testId -> Get results by test ID
router.get('/test/:testId', getCodingResultByTest);

// GET /api/coding-results/:id -> Get specific result by ID
router.get('/:id', getCodingResult);

// DELETE /api/coding-results/:id -> Delete specific result by ID
router.delete('/:id', deleteCodingResult);

module.exports = router;
