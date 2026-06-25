import axios from "axios";

// Judge0 API URL
const JUDGE0_API_URL =
  import.meta.env.VITE_JUDGE0_API_URL || "https://ce.judge0.com";

// Judge0 language IDs
const languageMap = {
  java: 62,
  python: 71,
  cpp: 54,
  javascript: 63,
};

// Encode to Base64
const encodeBase64 = (str) => {
  if (!str) return "";
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
};

// Decode from Base64
const decodeBase64 = (str) => {
  if (!str) return "";
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return atob(str);
  }
};

// Headers
const getHeaders = () => ({
  "Content-Type": "application/json",
});

export const runCode = async (
  sourceCode,
  language,
  stdin = ""
) => {
  const languageId = languageMap[language.toLowerCase()];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const headers = getHeaders();

  // Submit code
  const submitResponse = await axios.post(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
    {
      source_code: encodeBase64(sourceCode),
      language_id: languageId,
      stdin: encodeBase64(stdin),
    },
    {
      headers,
    }
  );

  const token = submitResponse.data.token;

  if (!token) {
    throw new Error("Submission failed.");
  }

  let result = null;
  let retries = 0;

  while (retries < 20) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
      {
        headers,
      }
    );

    result = response.data;

    const statusId =
      result.status_id || result.status?.id;

    if (statusId > 2) break;

    retries++;
  }

  if (!result) {
    throw new Error("No result returned.");
  }

  if (result.stdout)
    result.stdout = decodeBase64(result.stdout);

  if (result.stderr)
    result.stderr = decodeBase64(result.stderr);

  if (result.compile_output)
    result.compile_output = decodeBase64(
      result.compile_output
    );

  if (result.message)
    result.message = decodeBase64(result.message);

  return result;
};

export default runCode;