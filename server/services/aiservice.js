const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generateQuestions = async (text) => {
  try {
    const prompt = `
You are an expert assessment creator.

Convert the following text into multiple-choice questions.

Return ONLY valid JSON.

Format:

[
  {
    "type": "mcq",
    "question": "...",
    "options": [
      "...",
      "...",
      "...",
      "..."
    ],
    "correctAnswer": "...",
    "marks": 1,
    "difficulty": "Easy",
    "topic": "...",
    "explanation": "..."
  }
]

Rules:
- No markdown.
- No explanation outside JSON.
- Return only a JSON array.
- Generate as many good questions as possible.
- Every question must have exactly 4 options.
- Correct answer must match one option exactly.

TEXT:

${text}
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  generateQuestions,
};