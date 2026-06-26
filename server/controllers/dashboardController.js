const User = require('../models/user');
const Result = require('../models/result');
const CodingResult = require('../models/CodingResult');
const Test = require('../models/Test');

// 1. Get Student Dashboard Statistics
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch user details
    const student = await User.findById(studentId).select('name email role subscriptionType department branch cgpa');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch MCQ & Coding attempts
    const mcqAttempts = await Result.find({ userId: studentId }).sort({ createdAt: -1 });
    const codingAttempts = await CodingResult.find({ studentId }).sort({ submittedAt: -1 });

    // Fetch all tests
    const allTests = await Test.find();

    // 1. Completed & Pending Assessment Counts
    const completedMcqIds = mcqAttempts.map(a => a.testId.toString());
    const completedCodingIds = codingAttempts.map(a => a.testId.toString());
    const completedTestIds = [...new Set([...completedMcqIds, ...completedCodingIds])];

    const completedCount = completedTestIds.length;
    const pendingCount = Math.max(0, allTests.length - completedCount);

    // 2. Statistics Breakdown (MCQ and Coding)
    let mcqTotalScored = 0;
    let mcqTotalMax = 0;
    let mcqHighest = 0;
    mcqAttempts.forEach(a => {
      mcqTotalScored += a.score || 0;
      mcqTotalMax += a.total || 0;
      const pct = a.total > 0 ? (a.score / a.total) * 100 : 0;
      if (pct > mcqHighest) mcqHighest = pct;
    });
    const mcqAvg = mcqTotalMax > 0 ? (mcqTotalScored / mcqTotalMax) * 100 : 0;

    let codingTotalScored = 0;
    let codingTotalMax = 0;
    let codingHighest = 0;
    codingAttempts.forEach(a => {
      codingTotalScored += a.totalScore || 0;
      const maxTC = a.answers ? a.answers.reduce((sum, ans) => sum + (ans.totalTestCases || 0), 0) : 0;
      codingTotalMax += maxTC;
      const pct = a.percentage || 0;
      if (pct > codingHighest) codingHighest = pct;
    });
    const codingAvg = codingTotalMax > 0 ? (codingTotalScored / codingTotalMax) * 100 : 0;

    // 3. Overall Averages & Highest
    const allPercentages = [
      ...mcqAttempts.map(a => a.total > 0 ? (a.score / a.total) * 100 : 0),
      ...codingAttempts.map(a => a.percentage || 0)
    ];

    const highestScore = allPercentages.length > 0 ? Math.max(...allPercentages) : 0;
    const averageScore = allPercentages.length > 0 
      ? allPercentages.reduce((sum, val) => sum + val, 0) / allPercentages.length 
      : 0;

    // 4. Upcoming Tests (Not attempted yet)
    const upcomingTests = allTests.filter(t => !completedTestIds.includes(t._id.toString())).slice(0, 3);

    // 5. Recent Results
    const recentMcq = await Promise.all(mcqAttempts.slice(0, 3).map(async (a) => {
      const test = allTests.find(t => t._id.toString() === a.testId.toString());
      return {
        _id: a._id,
        testName: test ? test.title : "Assessment Test",
        type: "mcq",
        score: `${a.score} / ${a.total}`,
        percentage: a.total > 0 ? (a.score / a.total) * 100 : 0,
        date: a.createdAt
      };
    }));

    const recentCoding = await Promise.all(codingAttempts.slice(0, 3).map(async (a) => {
      const test = allTests.find(t => t._id.toString() === a.testId.toString());
      return {
        _id: a._id,
        testName: test ? test.title : "Assessment Test",
        type: "coding",
        score: `${a.totalScore} pts`,
        percentage: a.percentage,
        date: a.submittedAt || a.createdAt
      };
    }));

    const recentResults = [...recentMcq, ...recentCoding]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // 6. Recent Activity Feed
    const activityMcq = mcqAttempts.map(a => {
      const test = allTests.find(t => t._id.toString() === a.testId.toString());
      return {
        type: "submission",
        message: `Completed MCQ Assessment "${test ? test.title : 'Test'}" with score of ${a.score}/${a.total}`,
        date: a.createdAt
      };
    });

    const activityCoding = codingAttempts.map(a => {
      const test = allTests.find(t => t._id.toString() === a.testId.toString());
      return {
        type: "submission",
        message: `Submitted Coding Assessment "${test ? test.title : 'Test'}" (${a.percentage.toFixed(1)}% test cases passed)`,
        date: a.submittedAt || a.createdAt
      };
    });

    const recentActivity = [...activityMcq, ...activityCoding]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    // 7. Chart performance data points (chronological scores)
    const chartData = [...mcqAttempts, ...codingAttempts]
      .map(a => {
        const test = allTests.find(t => t._id.toString() === (a.testId || '').toString());
        const pct = a.total !== undefined
          ? (a.total > 0 ? (a.score / a.total) * 100 : 0)
          : (a.percentage || 0);

        return {
          name: test ? test.title.substring(0, 10) + ".." : "Test",
          score: Math.round(pct),
          date: a.submittedAt || a.createdAt
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological order for line graph

    return res.status(200).json({
      profile: student,
      completedCount,
      pendingCount,
      averageScore,
      highestScore,
      codingStats: {
        attempted: codingAttempts.length,
        average: codingAvg,
        highest: codingHighest
      },
      mcqStats: {
        attempted: mcqAttempts.length,
        average: mcqAvg,
        highest: mcqHighest
      },
      recentResults,
      upcomingTests,
      recentActivity,
      chartData
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return res.status(500).json({ message: "Server error aggregating student stats", error: error.message });
  }
};

// 2. Update Student Profile Summary
const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { department, branch, cgpa } = req.body;

    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (department !== undefined) user.department = department;
    if (branch !== undefined) user.branch = branch;
    if (cgpa !== undefined) user.cgpa = parseFloat(cgpa) || 0;

    await user.save();

    return res.status(200).json({
      message: "Profile Updated Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionType: user.subscriptionType,
        department: user.department,
        branch: user.branch,
        cgpa: user.cgpa
      }
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return res.status(500).json({ message: "Server error updating profile", error: error.message });
  }
};

// 3. Get Admin Dashboard Statistics
const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTests = await Test.countDocuments();
    const codingTests = await Test.countDocuments({ testType: 'coding' });
    const mcqTests = await Test.countDocuments({ testType: 'mcq' });

    const mcqAttempts = await Result.find();
    const codingAttempts = await CodingResult.find();
    const totalAttempts = mcqAttempts.length + codingAttempts.length;

    // Averages & High/Low
    const allPercentages = [
      ...mcqAttempts.map(a => a.total > 0 ? (a.score / a.total) * 100 : 0),
      ...codingAttempts.map(a => a.percentage || 0)
    ];

    const averageScore = allPercentages.length > 0 
      ? allPercentages.reduce((sum, v) => sum + v, 0) / allPercentages.length 
      : 0;

    const highestScore = allPercentages.length > 0 ? Math.max(...allPercentages) : 0;
    const lowestScore = allPercentages.length > 0 ? Math.min(...allPercentages) : 0;

    // Pass / Fail Ratio (>= 50% is pass)
    const passedCount = allPercentages.filter(pct => pct >= 50).length;
    const passPercentage = totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0;
    const failPercentage = totalAttempts > 0 ? 100 - passPercentage : 0;

    // Top Performers calculation (by cumulative score)
    const students = await User.find({ role: 'student' }).select('name department branch');
    const performanceList = students.map(s => {
      const sId = s._id.toString();
      const sMcq = mcqAttempts.filter(a => a.userId === sId).reduce((sum, a) => sum + (a.score || 0), 0);
      const sCoding = codingAttempts.filter(a => a.studentId.toString() === sId).reduce((sum, a) => sum + (a.totalScore || 0), 0);
      return {
        name: s.name,
        department: s.department || s.branch || "N/A",
        score: sMcq + sCoding
      };
    });

    performanceList.sort((a, b) => b.score - a.score);
    const topPerformers = performanceList.slice(0, 5);

    // Recent Submissions (Last 10)
    const recentMcq = mcqAttempts.slice(-5).map(a => {
      const s = students.find(st => st._id.toString() === a.userId);
      return {
        studentName: s ? s.name : "Student",
        testName: "MCQ Assessment",
        score: `${a.score} / ${a.total}`,
        percentage: a.total > 0 ? (a.score / a.total) * 100 : 0,
        date: a.createdAt
      };
    });

    const recentCoding = codingAttempts.slice(-5).map(a => {
      const s = students.find(st => st._id.toString() === a.studentId.toString());
      return {
        studentName: s ? s.name : "Student",
        testName: "Coding Assessment",
        score: `${a.totalScore} pts`,
        percentage: a.percentage,
        date: a.submittedAt || a.createdAt
      };
    });

    const recentSubmissions = [...recentMcq, ...recentCoding]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Chart Data for score distributions
    const scoreRanges = {
      under40: allPercentages.filter(pct => pct < 40).length,
      range40to70: allPercentages.filter(pct => pct >= 40 && pct <= 70).length,
      above70: allPercentages.filter(pct => pct > 70).length
    };

    return res.status(200).json({
      totalStudents,
      totalTests,
      codingTests,
      mcqTests,
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      passPercentage,
      failPercentage,
      topPerformers,
      recentSubmissions,
      scoreRanges
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    return res.status(500).json({ message: "Server error calculating admin statistics", error: error.message });
  }
};

module.exports = {
  getStudentStats,
  updateStudentProfile,
  getAdminStats
};
