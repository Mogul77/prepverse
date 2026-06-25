const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/codeExecutionController');

// POST /api/execute/run -> runCode
router.post('/run', runCode);

module.exports = router;
