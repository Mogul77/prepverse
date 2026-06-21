const express = require('express');
const router = express.Router();
const {
  createCodingQuestion,
  getCodingQuestionsByTest,
  updateCodingQuestion,
  deleteCodingQuestion
} = require('../controllers/codingController');

// POST /api/coding -> createCodingQuestion
router.post('/', createCodingQuestion);

// GET /api/coding/test/:testId -> getCodingQuestionsByTest
router.get('/test/:testId', getCodingQuestionsByTest);

// PUT /api/coding/:id -> updateCodingQuestion
router.put('/:id', updateCodingQuestion);

// DELETE /api/coding/:id -> deleteCodingQuestion
router.delete('/:id', deleteCodingQuestion);

module.exports = router;
