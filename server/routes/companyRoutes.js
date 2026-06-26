const express = require('express');
const router = express.Router();
const {
  companyRegister,
  companyLogin,
  createDrive,
  getDrives,
  applyToDrive,
  getApplicantsForDrive,
  updateApplicantStatus,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  getStudentApplications
} = require('../controllers/companyController');
const { protect } = require('../middleware/authmiddleware');

// Public company auth
router.post('/register', companyRegister);
router.post('/login', companyLogin);

// Protected routes
router.get('/drives', protect, getDrives);
router.get('/student-applications', protect, getStudentApplications);

// Recruiter specific
router.post('/create-drive', protect, createDrive);
router.get('/applicants/:driveId', protect, getApplicantsForDrive);
router.post('/application/:applicationId/status', protect, updateApplicantStatus);

// Student specific
router.post('/apply/:driveId', protect, applyToDrive);

// Admin specific
router.get('/admin/companies', protect, getAllCompanies);
router.post('/admin/approve/:companyId', protect, approveCompany);
router.delete('/admin/reject/:companyId', protect, rejectCompany);

module.exports = router;
