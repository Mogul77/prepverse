const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const { generateQuestions } = require("../services/aiservice");

// Configure Multer
const storage = multer.diskStorage({
  destination: "upload/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const filePath = req.file.path;
    const extension = path
      .extname(req.file.originalname)
      .toLowerCase();

    let extractedText = "";

    // ==========================
    // Extract Text
    // ==========================

    if (extension === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } 
    else if (extension === ".docx") {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      extractedText = result.value;
    } 
    else if (extension === ".txt") {
      extractedText = fs.readFileSync(
        filePath,
        "utf8"
      );
    } 
    else {
      return res.status(400).json({
        message: "Unsupported file format",
      });
    }

    // ==========================
    // Generate AI Questions
    // ==========================

    const aiResponse = await generateQuestions(extractedText);

    // Gemini sometimes wraps JSON in ```json ... ```
    const cleanedResponse = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let questions;

    try {
      questions = JSON.parse(cleanedResponse);
    } catch (err) {
      console.log("JSON Parse Error:");
      console.log(cleanedResponse);

      return res.status(500).json({
        message: "Gemini returned invalid JSON",
        raw: cleanedResponse,
      });
    }

    res.status(200).json({
      message: "Questions generated successfully",
      totalQuestions: questions.length,
      questions,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadFile,
};