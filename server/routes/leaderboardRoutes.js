const express = require('express');
const router = express.Router();
const {
  getOverallLeaderboard,
  getTestLeaderboard,
  getMCQLeaderboard,
  getCodingLeaderboard
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authmiddleware');

// All leaderboard routes are protected
router.use(protect);

router.get('/overall', getOverallLeaderboard);
router.get('/test/:testId', getTestLeaderboard);
router.get('/mcq', getMCQLeaderboard);
router.get('/coding', getCodingLeaderboard);

module.exports = router;
