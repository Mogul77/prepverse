const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Company Register
const companyRegister = async (req, res) => {
  try {
    const { name, email, password, website, description } = req.body;
    
    const existing = await Company.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Company with this email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      website: website || "",
      description: description || "",
      isApproved: false // Admin must approve
    });

    return res.status(201).json({
      message: "Company registration successful. Awaiting admin approval.",
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        isApproved: false
      }
    });
  } catch (error) {
    console.error("Error in companyRegister:", error);
    return res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// 2. Company Login
const companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!company.isApproved) {
      return res.status(403).json({ message: "Your registration is pending approval by the administrator." });
    }

    const token = jwt.sign(
      { id: company._id, role: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        role: "company"
      }
    });
  } catch (error) {
    console.error("Error in companyLogin:", error);
    return res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// 3. Create Placement Drive (Recruiter)
const createDrive = async (req, res) => {
  try {
    const { jobRole, ctc, location, eligibilityCriteria, eligibleBranches, minCgpa, deadline } = req.body;
    const companyId = req.user.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const drive = await PlacementDrive.create({
      companyId,
      companyName: company.name,
      jobRole,
      ctc,
      location,
      eligibilityCriteria: eligibilityCriteria || "",
      eligibleBranches: eligibleBranches || [],
      minCgpa: parseFloat(minCgpa) || 0,
      deadline: new Date(deadline)
    });

    return res.status(201).json({
      message: "Placement Drive created successfully",
      drive
    });
  } catch (error) {
    console.error("Error in createDrive:", error);
    return res.status(500).json({ message: "Server error creating placement drive", error: error.message });
  }
};

// 4. Get Placement Drives (Recruiter views own, Student views all published)
const getDrives = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'company') {
      query = { companyId: req.user.id };
    }
    const drives = await PlacementDrive.find(query).sort({ deadline: 1 });
    return res.status(200).json(drives);
  } catch (error) {
    console.error("Error fetching drives:", error);
    return res.status(500).json({ message: "Server error fetching drives", error: error.message });
  }
};

// 5. Apply to Placement Drive (Student)
const applyToDrive = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { driveId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Placement Drive not found" });
    }

    // Check if deadline is passed
    if (new Date() > new Date(drive.deadline)) {
      return res.status(400).json({ message: "Application deadline has already passed." });
    }

    // Check duplicate application
    const existing = await PlacementApplication.findOne({ driveId, studentId });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this job drive." });
    }

    // Eligibility check 1: CGPA
    if (student.cgpa < drive.minCgpa) {
      return res.status(403).json({
        message: `Eligibility failed: Minimum CGPA required is ${drive.minCgpa.toFixed(2)}, but your CGPA is ${student.cgpa.toFixed(2)}.`
      });
    }

    // Eligibility check 2: Branch matching
    const normalizedBranches = drive.eligibleBranches.map(b => b.trim().toLowerCase());
    const studentBranch = (student.branch || "").trim().toLowerCase();
    const studentDept = (student.department || "").trim().toLowerCase();

    const isBranchEligible = drive.eligibleBranches.length === 0 || 
      normalizedBranches.includes(studentBranch) || 
      normalizedBranches.includes(studentDept) ||
      normalizedBranches.includes("all");

    if (!isBranchEligible) {
      return res.status(403).json({
        message: `Eligibility failed: Your branch (${student.branch || "N/A"}) is not eligible for this placement drive.`
      });
    }

    const application = await PlacementApplication.create({
      driveId,
      studentId
    });

    return res.status(201).json({
      message: "Application submitted successfully!",
      application
    });
  } catch (error) {
    console.error("Error applying to placement drive:", error);
    return res.status(500).json({ message: "Server error submitting application", error: error.message });
  }
};

// 6. Get Applicants for Recruiter Drive
const getApplicantsForDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const companyId = req.user.id;

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Placement Drive not found" });
    }

    if (drive.companyId.toString() !== companyId) {
      return res.status(403).json({ message: "Not authorized to view applicants for this drive." });
    }

    const applications = await PlacementApplication.find({ driveId })
      .populate('studentId', 'name email department branch cgpa')
      .sort({ appliedAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ message: "Server error fetching applicants", error: error.message });
  }
};

// 7. Update Candidate Status (Recruiter)
const updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; 
    const companyId = req.user.id;

    const application = await PlacementApplication.findById(applicationId)
      .populate('driveId');
      
    if (!application) {
      return res.status(404).json({ message: "Application record not found" });
    }

    if (application.driveId.companyId.toString() !== companyId) {
      return res.status(403).json({ message: "Not authorized to update this candidate." });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      message: `Candidate status updated to ${status} successfully.`,
      application
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ message: "Server error updating applicant status", error: error.message });
  }
};

// 8. Admin view list of companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies list:", error);
    return res.status(500).json({ message: "Server error fetching companies list", error: error.message });
  }
};

// 9. Admin Approves a Company
const approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isApproved = true;
    await company.save();

    return res.status(200).json({
      message: `Company "${company.name}" has been approved.`,
      company
    });
  } catch (error) {
    console.error("Error approving company:", error);
    return res.status(500).json({ message: "Server error approving company", error: error.message });
  }
};

// 10. Admin Rejects / Deletes a Company
const rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findByIdAndDelete(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    await PlacementDrive.deleteMany({ companyId });
    await PlacementApplication.deleteMany({ driveId: { $in: await PlacementDrive.find({ companyId }).select('_id') } });

    return res.status(200).json({
      message: `Company "${company.name}" registration registration rejected and removed.`
    });
  } catch (error) {
    console.error("Error rejecting company:", error);
    return res.status(500).json({ message: "Server error rejecting company", error: error.message });
  }
};

// 11. Student Views applied drives list
const getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const applications = await PlacementApplication.find({ studentId })
      .populate('driveId')
      .sort({ appliedAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching student applications:", error);
    return res.status(500).json({ message: "Server error fetching student applications", error: error.message });
  }
};

module.exports = {
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
};
