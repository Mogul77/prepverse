import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CompanyDashboard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Drive Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [driveForm, setDriveForm] = useState({
    jobRole: "",
    ctc: "",
    location: "",
    minCgpa: "",
    eligibleBranches: "",
    eligibilityCriteria: "",
    deadline: ""
  });
  const [creatingDrive, setCreatingDrive] = useState(false);

  // Applicants view state
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/company/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "company") {
      navigate("/dashboard");
      return;
    }

    setCompany(parsedUser);
    fetchCompanyDrives(token);
  }, [navigate]);

  const fetchCompanyDrives = async (token) => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get("http://localhost:5000/api/company/drives", config);
      setDrives(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load recruitment drives.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDriveForm({
      ...driveForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setCreatingDrive(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Split eligible branches by comma
      const branchesArray = driveForm.eligibleBranches
        .split(",")
        .map(b => b.trim())
        .filter(b => b.length > 0);

      await axios.post("http://localhost:5000/api/company/create-drive", {
        ...driveForm,
        eligibleBranches: branchesArray,
        minCgpa: parseFloat(driveForm.minCgpa) || 0
      }, config);

      setDriveForm({
        jobRole: "",
        ctc: "",
        location: "",
        minCgpa: "",
        eligibleBranches: "",
        eligibilityCriteria: "",
        deadline: ""
      });
      setShowCreateForm(false);
      setCreatingDrive(false);
      fetchCompanyDrives(token);
      alert("Placement drive published successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create drive: " + (err.response?.data?.message || err.message));
      setCreatingDrive(false);
    }
  };

  const fetchApplicants = async (drive) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSelectedDrive(drive);
      setLoadingApplicants(true);
      setApplicants([]);

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get(`http://localhost:5000/api/company/applicants/${drive._id}`, config);
      setApplicants(res.data);
      setLoadingApplicants(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch applicant data.");
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(`http://localhost:5000/api/company/application/${appId}/status`, {
        status: newStatus
      }, config);

      // Refresh applicant list
      fetchApplicants(selectedDrive);
      alert(`Candidate status marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/company/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-8 text-gray-300">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-semibold animate-pulse font-mono text-sm">Loading corporate dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-500 rounded-sm"></span>
            Recruiter Workspace: {company?.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="py-1.5 px-4 bg-blue-650 hover:bg-blue-750 text-white rounded-lg text-xs font-bold transition-all shadow shadow-blue-900 cursor-pointer"
          >
            {showCreateForm ? "View Active Drives" : "Publish Placement Drive"}
          </button>
          <button onClick={handleLogout} className="py-1.5 px-3 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6 overflow-y-auto">
        
        {/* CREATE NEW DRIVE FORM */}
        {showCreateForm ? (
          <div className="bg-gray-900 border border-gray-855 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
            <div className="border-b border-gray-805 pb-3">
              <h2 className="text-lg font-black text-white">Create Placement Drive</h2>
              <p className="text-xs text-gray-500">Fill in job requirements, salary package, and eligibility criteria</p>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Job Role / Designation</label>
                  <input
                    type="text"
                    name="jobRole"
                    required
                    placeholder="Software Engineer Intern"
                    value={driveForm.jobRole}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-350 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">CTC / Salary Package</label>
                  <input
                    type="text"
                    name="ctc"
                    required
                    placeholder="e.g. 12 LPA"
                    value={driveForm.ctc}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-355 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Job Location</label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. Bangalore, IN"
                    value={driveForm.location}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-350 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Minimum CGPA Requirement</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="minCgpa"
                    required
                    placeholder="e.g. 7.50"
                    value={driveForm.minCgpa}
                    onChange={handleInputChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-350 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Eligible Branches (Comma separated)</label>
                <input
                  type="text"
                  name="eligibleBranches"
                  required
                  placeholder="CSE, IT, ECE (or 'all' for all branches)"
                  value={driveForm.eligibleBranches}
                  onChange={handleInputChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-350 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Deadline Date</label>
                <input
                  type="date"
                  name="deadline"
                  required
                  value={driveForm.deadline}
                  onChange={handleInputChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-350 outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Eligibility Criteria Description</label>
                <textarea
                  name="eligibilityCriteria"
                  placeholder="Describe specific job requirements, coding test criteria, or skills expected..."
                  value={driveForm.eligibilityCriteria}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-355 outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creatingDrive}
                className="w-full py-3 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-900 cursor-pointer disabled:opacity-50"
              >
                {creatingDrive ? "Publishing..." : "Publish Hiring Drive"}
              </button>
            </form>
          </div>
        ) : (
          /* ACTIVE PLACEMENT DRIVES LIST */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List left side (2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
                Active Recruitment Drives ({drives.length})
              </h2>

              {drives.length === 0 ? (
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-12 text-center text-gray-500 text-xs italic font-semibold">
                  You have not published any recruitment drives yet. Click "Publish Placement Drive" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {drives.map((d) => {
                    const isSelected = selectedDrive?._id === d._id;
                    const isExpired = new Date() > new Date(d.deadline);

                    return (
                      <div 
                        key={d._id} 
                        className={`bg-gray-900 border rounded-2xl p-5 space-y-4 shadow-lg transition-all ${
                          isSelected ? "border-blue-500/80 ring-2 ring-blue-500/10" : "border-gray-850 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-base font-black text-white">{d.jobRole}</h3>
                            <span className="text-[10px] text-gray-505 block font-semibold mt-1">Location: {d.location} | CTC: {d.ctc}</span>
                          </div>
                          <button
                            onClick={() => fetchApplicants(d)}
                            className="px-3.5 py-1.5 bg-gray-800 border border-gray-750 hover:bg-gray-750 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            View Applicants
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[10px] bg-gray-950/40 p-3 rounded-xl border border-gray-850">
                          <div>
                            <span className="text-gray-500 block font-bold">Min CGPA</span>
                            <strong className="text-white font-extrabold font-mono">{d.minCgpa.toFixed(2)}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block font-bold">Branches</span>
                            <strong className="text-white font-extrabold truncate block">{d.eligibleBranches.join(", ") || "All"}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block font-bold">Deadline</span>
                            <strong className={`font-mono font-extrabold ${isExpired ? "text-rose-400" : "text-gray-300"}`}>
                              {new Date(d.deadline).toLocaleDateString()}
                            </strong>
                          </div>
                        </div>

                        {d.eligibilityCriteria && (
                          <p className="text-[11px] text-gray-450 italic leading-relaxed whitespace-pre-wrap">{d.eligibilityCriteria}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applicants panel right side (1 column) */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
                Applicants Evaluation
              </h2>

              {!selectedDrive ? (
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-8 text-center text-gray-500 text-xs italic font-medium">
                  Select "View Applicants" on a drive to evaluate student profiles.
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-gray-805 pb-3.5">
                    <h3 className="text-xs font-black text-gray-450 uppercase tracking-wider">Drive: {selectedDrive.jobRole}</h3>
                    <span className="text-[10px] text-gray-500 font-bold block mt-1">{applicants.length} Applicants Applied</span>
                  </div>

                  {loadingApplicants ? (
                    <div className="text-center py-10">
                      <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-[10px] text-gray-505 font-mono">Fetching candidate pool...</p>
                    </div>
                  ) : applicants.length === 0 ? (
                    <p className="text-xs text-gray-500 italic font-medium py-6 text-center">No applications submitted yet for this drive.</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {applicants.map((app) => {
                        const s = app.studentId || {};
                        
                        return (
                          <div key={app._id} className="p-3.5 bg-gray-950/40 border border-gray-850 rounded-xl space-y-3 text-xs">
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <h4 className="font-extrabold text-white leading-normal">{s.name || "Student"}</h4>
                                <p className="text-[10px] text-gray-500">{s.department || s.branch || "N/A"} | CGPA: {s.cgpa?.toFixed(2) || "0.00"}</p>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                app.status === 'Shortlisted' ? 'bg-emerald-950 text-emerald-400' : app.status === 'Rejected' ? 'bg-rose-950 text-rose-455' : 'bg-blue-950 text-blue-400'
                              }`}>
                                {app.status}
                              </span>
                            </div>

                            {app.status === 'Applied' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(app._id, "Shortlisted")}
                                  className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all shadow cursor-pointer text-center"
                                >
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app._id, "Rejected")}
                                  className="flex-1 py-1 bg-red-650 hover:bg-red-750 text-white rounded text-[10px] font-bold transition-all shadow cursor-pointer text-center"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default CompanyDashboard;
