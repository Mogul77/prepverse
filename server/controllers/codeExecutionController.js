const { submitCode, pollSubmission } = require('../services/judge0Service');

/**
 * Controller to handle code execution requests.
 * Expects language, sourceCode, and optional stdin in the request body.
 * Submits the code to Judge0, polls for the result, and returns output metrics.
 */
exports.runCode = async (req, res) => {
  try {
    const { language, sourceCode, stdin } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({ 
        message: 'Bad Request: language and sourceCode are required fields.' 
      });
    }

    // 1. Submit code to Judge0
    const token = await submitCode(sourceCode, language, stdin || '');

    // 2. Poll for the final execution result
    const result = await pollSubmission(token);

    if (!result) {
      return res.status(500).json({ 
        message: 'Internal Server Error: No execution response received from Judge0.' 
      });
    }

    // 3. Return the decoded execution metrics
    return res.status(200).json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      status: result.status || null,
      time: result.time || '0.00',
      memory: result.memory || 0
    });
  } catch (error) {
    console.error('Code execution controller error:', error);
    return res.status(500).json({
      message: 'Server error occurred during code execution.',
      error: error.message
    });
  }
};
