require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authroutes = require("./routes/authroutes");
const testRoutes = require("./routes/testRoutes");
const { protect } = require("./middleware/authmiddleware");
const resultRoutes = require("./routes/resultRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const codingRoutes = require("./routes/codingRoutes");
const codeExecutionRoutes = require("./routes/codeExecutionRoutes");
const codingResultRoutes = require("./routes/codingResultRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const companyRoutes = require("./routes/companyRoutes");

const app = express();

console.log("MY REAL SERVER");
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authroutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/code", codeExecutionRoutes);
app.use("/api/coding-results", codingResultRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/company", companyRoutes);
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});