const axios = require('axios');

// Map languages to Judge0 language IDs
const languageMap = {
  java: 62,        // Java (OpenJDK 13.0.1)
  python: 71,      // Python (3.8.1)
  cpp: 54,         // C++ (GCC 9.2.0)
  javascript: 63   // JavaScript (Node.js 12.14.0)
};

// Helper function to encode string to Base64 (supporting Unicode characters)
const encodeBase64 = (str) => {
  if (!str) return '';
  return Buffer.from(str, 'utf-8').toString('base64');
};

// Helper function to decode string from Base64 (supporting Unicode characters)
const decodeBase64 = (str) => {
  if (!str) return '';
  return Buffer.from(str, 'base64').toString('utf-8');
};

// Helper to get request headers
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const key = process.env.JUDGE0_API_KEY;
  if (key) {
    const url = process.env.JUDGE0_API_URL || '';
    if (url.includes('rapidapi.com')) {
      headers['X-RapidAPI-Key'] = key;
      try {
        const urlObj = new URL(url);
        headers['X-RapidAPI-Host'] = urlObj.hostname;
      } catch {
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
      }
    } else {
      headers['X-Auth-Token'] = key;
    }
  }
  return headers;
};

/**
 * Submits source code to Judge0 and returns the token.
 * @param {string} sourceCode - The code to run.
 * @param {string} language - The programming language name (java, python, cpp, javascript).
 * @param {string} stdin - Standard input for the program.
 * @returns {Promise<string>} - The execution submission token.
 */
const submitCode = async (sourceCode, language, stdin = '') => {
  const normalizedLanguage = language.toLowerCase();
  const languageId = languageMap[normalizedLanguage];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const url = process.env.JUDGE0_API_URL || 'http://localhost:2358';
  const headers = getHeaders();

  const response = await axios.post(
    `${url}/submissions?base64_encoded=true&wait=false`,
    {
      source_code: encodeBase64(sourceCode),
      language_id: languageId,
      stdin: encodeBase64(stdin)
    },
    { headers }
  );

  const token = response.data.token;
  if (!token) {
    throw new Error('Failed to retrieve token from Judge0 submission.');
  }

  return token;
};

/**
 * Retrieves the submission from Judge0 and decodes outputs.
 * @param {string} token - The submission token.
 * @returns {Promise<Object>} - The decoded execution result.
 */
const getSubmission = async (token) => {
  const url = process.env.JUDGE0_API_URL || 'http://localhost:2358';
  const headers = getHeaders();

  const response = await axios.get(
    `${url}/submissions/${token}?base64_encoded=true`,
    { headers }
  );

  const result = response.data;

  // Decode outputs
  if (result.stdout) result.stdout = decodeBase64(result.stdout);
  if (result.stderr) result.stderr = decodeBase64(result.stderr);
  if (result.compile_output) result.compile_output = decodeBase64(result.compile_output);
  if (result.message) result.message = decodeBase64(result.message);

  return result;
};

/**
 * Polls the submission until it has completed execution.
 * @param {string} token - The submission token.
 * @returns {Promise<Object>} - The final decoded execution result.
 */
const pollSubmission = async (token) => {
  let result = null;
  let statusId = 1;
  let retries = 0;
  const maxRetries = 20; // 20 seconds maximum execution polling

  while ((statusId === 1 || statusId === 2) && retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    result = await getSubmission(token);
    statusId = result.status_id || (result.status && result.status.id);
    retries++;
  }

  return result;
};

module.exports = {
  submitCode,
  getSubmission,
  pollSubmission
};
