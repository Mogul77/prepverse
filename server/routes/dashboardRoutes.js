const express = require('express');
const router = express.Router();
const {
  getStudentStats,
  updateStudentProfile,
  getAdminStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authmiddleware');

// All dashboard endpoints are protected by authentication
router.use(protect);

router.get('/student-stats', getStudentStats);
router.post('/profile', updateStudentProfile);
router.get('/admin-stats', getAdminStats);

module.exports = router;
