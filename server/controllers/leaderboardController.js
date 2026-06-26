const User = require('../models/user');
const Result = require('../models/result');
const CodingResult = require('../models/CodingResult');
const Test = require('../models/Test');

// 1. Overall Leaderboard
const getOverallLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name department branch');
    const mcqResults = await Result.find();
    const codingResults = await CodingResult.find();

    // Group results by student
    const mcqMap = {};
    mcqResults.forEach(r => {
      if (!mcqMap[r.userId]) mcqMap[r.userId] = [];
      mcqMap[r.userId].push(r);
    });

    const codingMap = {};
    codingResults.forEach(r => {
      const sId = r.studentId.toString();
      if (!codingMap[sId]) codingMap[sId] = [];
      codingMap[sId].push(r);
    });

    const leaderboard = students.map(student => {
      const sId = student._id.toString();
      const studentMcqs = mcqMap[sId] || [];
      const studentCodings = codingMap[sId] || [];

      let mcqScore = 0;
      let mcqMax = 0;
      let lastMcqTime = 0;

      studentMcqs.forEach(r => {
        mcqScore += r.score || 0;
        mcqMax += r.total || 0;
        const rTime = new Date(r.createdAt).getTime();
        if (rTime > lastMcqTime) lastMcqTime = rTime;
      });

      let codingScore = 0;
      let codingMax = 0;
      let lastCodingTime = 0;

      studentCodings.forEach(r => {
        codingScore += r.totalScore || 0;
        const totalTC = r.answers ? r.answers.reduce((sum, ans) => sum + (ans.totalTestCases || 0), 0) : 0;
        codingMax += totalTC;
        
        const rTime = new Date(r.submittedAt || r.createdAt).getTime();
        if (rTime > lastCodingTime) lastCodingTime = rTime;
      });

      const totalScore = mcqScore + codingScore;
      const maxScore = mcqMax + codingMax;
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      const latestTimeMs = Math.max(lastMcqTime, lastCodingTime);
      const submissionTime = latestTimeMs > 0 ? new Date(latestTimeMs) : null;

      return {
        studentId: student._id,
        name: student.name,
        department: student.department || student.branch || "N/A",
        mcqScore,
        codingScore,
        totalScore,
        percentage,
        submissionTime
      };
    });

    // Sort: Total Score desc, then earliest submissionTime asc
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.submissionTime && b.submissionTime) {
        return a.submissionTime.getTime() - b.submissionTime.getTime();
      }
      if (a.submissionTime) return -1;
      if (b.submissionTime) return 1;
      return 0;
    });

    // Assign Rank
    const rankedLeaderboard = leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      ...entry
    }));

    return res.status(200).json(rankedLeaderboard);
  } catch (error) {
    console.error("Error in getOverallLeaderboard:", error);
    return res.status(500).json({ message: "Server error calculating leaderboard", error: error.message });
  }
};

// 2. Test-wise Leaderboard
const getTestLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const students = await User.find({ role: 'student' }).select('name department branch');
    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = s;
    });

    let leaderboard = [];

    if (test.testType === 'mcq') {
      const results = await Result.find({ testId });
      leaderboard = results.map(r => {
        const student = studentMap[r.userId];
        const pct = r.total > 0 ? (r.score / r.total) * 100 : 0;
        return {
          studentId: r.userId,
          name: student ? student.name : "Unknown",
          department: student ? (student.department || student.branch || "N/A") : "N/A",
          mcqScore: r.score,
          codingScore: 0,
          totalScore: r.score,
          percentage: pct,
          submissionTime: r.createdAt
        };
      });
    } else {
      const results = await CodingResult.find({ testId });
      leaderboard = results.map(r => {
        const student = studentMap[r.studentId.toString()];
        return {
          studentId: r.studentId,
          name: student ? student.name : "Unknown",
          department: student ? (student.department || student.branch || "N/A") : "N/A",
          mcqScore: 0,
          codingScore: r.totalScore,
          totalScore: r.totalScore,
          percentage: r.percentage,
          submissionTime: r.submittedAt || r.createdAt
        };
      });
    }

    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.submissionTime && b.submissionTime) {
        return new Date(a.submissionTime).getTime() - new Date(b.submissionTime).getTime();
      }
      if (a.submissionTime) return -1;
      if (b.submissionTime) return 1;
      return 0;
    });

    const rankedLeaderboard = leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      ...entry
    }));

    return res.status(200).json(rankedLeaderboard);
  } catch (error) {
    console.error("Error in getTestLeaderboard:", error);
    return res.status(500).json({ message: "Server error calculating test leaderboard", error: error.message });
  }
};

// 3. MCQ Leaderboard
const getMCQLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name department branch');
    const mcqResults = await Result.find();

    const mcqMap = {};
    mcqResults.forEach(r => {
      if (!mcqMap[r.userId]) mcqMap[r.userId] = [];
      mcqMap[r.userId].push(r);
    });

    const leaderboard = students.map(student => {
      const sId = student._id.toString();
      const studentMcqs = mcqMap[sId] || [];

      let mcqScore = 0;
      let mcqMax = 0;
      let lastMcqTime = 0;

      studentMcqs.forEach(r => {
        mcqScore += r.score || 0;
        mcqMax += r.total || 0;
        const rTime = new Date(r.createdAt).getTime();
        if (rTime > lastMcqTime) lastMcqTime = rTime;
      });

      const percentage = mcqMax > 0 ? (mcqScore / mcqMax) * 100 : 0;
      const submissionTime = lastMcqTime > 0 ? new Date(lastMcqTime) : null;

      return {
        studentId: student._id,
        name: student.name,
        department: student.department || student.branch || "N/A",
        mcqScore,
        codingScore: 0,
        totalScore: mcqScore,
        percentage,
        submissionTime
      };
    });

    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.submissionTime && b.submissionTime) {
        return a.submissionTime.getTime() - b.submissionTime.getTime();
      }
      if (a.submissionTime) return -1;
      if (b.submissionTime) return 1;
      return 0;
    });

    const rankedLeaderboard = leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      ...entry
    }));

    return res.status(200).json(rankedLeaderboard);
  } catch (error) {
    console.error("Error in getMCQLeaderboard:", error);
    return res.status(500).json({ message: "Server error calculating MCQ leaderboard", error: error.message });
  }
};

// 4. Coding Leaderboard
const getCodingLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name department branch');
    const codingResults = await CodingResult.find();

    const codingMap = {};
    codingResults.forEach(r => {
      const sId = r.studentId.toString();
      if (!codingMap[sId]) codingMap[sId] = [];
      codingMap[sId].push(r);
    });

    const leaderboard = students.map(student => {
      const sId = student._id.toString();
      const studentCodings = codingMap[sId] || [];

      let codingScore = 0;
      let codingMax = 0;
      let lastCodingTime = 0;

      studentCodings.forEach(r => {
        codingScore += r.totalScore || 0;
        const totalTC = r.answers ? r.answers.reduce((sum, ans) => sum + (ans.totalTestCases || 0), 0) : 0;
        codingMax += totalTC;
        
        const rTime = new Date(r.submittedAt || r.createdAt).getTime();
        if (rTime > lastCodingTime) lastCodingTime = rTime;
      });

      const percentage = codingMax > 0 ? (codingScore / codingMax) * 100 : 0;
      const submissionTime = lastCodingTime > 0 ? new Date(lastCodingTime) : null;

      return {
        studentId: student._id,
        name: student.name,
        department: student.department || student.branch || "N/A",
        mcqScore: 0,
        codingScore,
        totalScore: codingScore,
        percentage,
        submissionTime
      };
    });

    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.submissionTime && b.submissionTime) {
        return a.submissionTime.getTime() - b.submissionTime.getTime();
      }
      if (a.submissionTime) return -1;
      if (b.submissionTime) return 1;
      return 0;
    });

    const rankedLeaderboard = leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      ...entry
    }));

    return res.status(200).json(rankedLeaderboard);
  } catch (error) {
    console.error("Error in getCodingLeaderboard:", error);
    return res.status(500).json({ message: "Server error calculating coding leaderboard", error: error.message });
  }
};

module.exports = {
  getOverallLeaderboard,
  getTestLeaderboard,
  getMCQLeaderboard,
  getCodingLeaderboard
};
