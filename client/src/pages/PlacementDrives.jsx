import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function PlacementDrives() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchDrivesAndApplications(token);
  }, [navigate]);

  const fetchDrivesAndApplications = async (token) => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const drivesRes = await axios.get("http://localhost:5000/api/company/drives", config);
      setDrives(drivesRes.data);

      const appsRes = await axios.get("http://localhost:5000/api/company/student-applications", config);
      setApplications(appsRes.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch placement drive directories.");
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setApplyingId(driveId);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`http://localhost:5000/api/company/apply/${driveId}`, {}, config);
      
      // Refresh list to update status UI
      fetchDrivesAndApplications(token);
      setApplyingId(null);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit application");
      setApplyingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-8 text-gray-300">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-semibold animate-pulse font-mono text-sm">Retrieving hiring directories...</p>
      </div>
    );
  }

  // Helper check for eligibility
  const checkEligibility = (drive) => {
    if (!user) return { eligible: false, reason: "" };

    // CGPA Check
    const studentCgpa = user.cgpa || 0;
    if (studentCgpa < drive.minCgpa) {
      return { 
        eligible: false, 
        reason: `CGPA requirement: Min ${drive.minCgpa.toFixed(2)}, you have ${studentCgpa.toFixed(2)}` 
      };
    }

    // Branch Check (if eligibleBranches is not empty)
    if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
      const eligibleList = drive.eligibleBranches.map(b => b.trim().toLowerCase());
      const studentBranch = (user.branch || "").trim().toLowerCase();
      const studentDept = (user.department || "").trim().toLowerCase();

      const matched = eligibleList.includes(studentBranch) || 
                      eligibleList.includes(studentDept) || 
                      eligibleList.includes("all");

      if (!matched) {
        return { 
          eligible: false, 
          reason: `Eligible branches: ${drive.eligibleBranches.join(", ")}; your branch is ${user.branch || "N/A"}` 
        };
      }
    }

    return { eligible: true, reason: "" };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-855 p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-8">
            <span className="w-3 h-5 bg-blue-500 rounded-sm"></span>
            PrepVerse
          </h2>
          <ul className="space-y-3">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/tests" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                Tests
              </Link>
            </li>
            <li>
              <Link to="/results" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                Results
              </Link>
            </li>
            <li>
              <Link to="/coding-results" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                Coding Submissions
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link to="/placement-drives" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-850 transition-all">
                Placement Drives
              </Link>
            </li>

            {/* Admin Only Navigation */}
            {user?.role === "admin" && (
              <>
                <li className="pt-4 border-t border-gray-800">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-4">Admin Console</span>
                </li>
                <li>
                  <Link to="/admin-analytics" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                    Admin Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/create-test" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                    Create Test
                  </Link>
                </li>
                <li>
                  <Link to="/manage-test" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                    Manage Tests
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        
        <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow">
              {user?.name ? user.name[0] : 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-2 bg-red-655 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/dashboard" className="text-xs font-bold text-blue-400">Dashboard</Link>
          </div>
          <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-500 rounded-sm"></span>
            Campus Placement Drives
          </h1>
          <div className="text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
            Student Portal
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
          
          {/* Eligibility context strip */}
          <div className="bg-gray-900 border border-gray-855 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xl">
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Your Profiles Profile summary</span>
              <p className="text-sm font-bold text-white">
                Dept: <span className="text-blue-400 font-extrabold">{user?.department || "N/A"}</span> | Branch: <span className="text-blue-400 font-extrabold">{user?.branch || "N/A"}</span> | Cumulative CGPA: <span className="text-emerald-400 font-black">{user?.cgpa?.toFixed(2) || "0.00"}</span>
              </p>
            </div>
            <Link to="/dashboard" className="text-xs font-bold text-blue-400 hover:text-blue-300 shrink-0">
              Update Profile details &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Eligible jobs list (2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
                Recruitment Portals ({drives.length})
              </h2>

              {drives.length === 0 ? (
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-12 text-center text-gray-500 text-xs italic font-semibold">
                  No active hiring drives cataloged at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {drives.map((d) => {
                    const appliedRecord = applications.find(a => a.driveId?._id === d._id);
                    const eligibility = checkEligibility(d);
                    const isExpired = new Date() > new Date(d.deadline);

                    return (
                      <div key={d._id} className="bg-gray-900 border border-gray-850 rounded-2xl p-5 space-y-4 shadow-lg">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">{d.companyName}</span>
                            <h3 className="text-lg font-black text-white">{d.jobRole}</h3>
                            <span className="text-[10px] text-gray-505 block font-semibold mt-1">Location: {d.location} | CTC: {d.ctc}</span>
                          </div>
                          
                          {/* Apply/Status indicators */}
                          <div>
                            {appliedRecord ? (
                              <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border ${
                                appliedRecord.status === 'Shortlisted' ? 'bg-emerald-950 border-emerald-900 text-emerald-400' : appliedRecord.status === 'Rejected' ? 'bg-rose-950 border-rose-900 text-rose-455' : 'bg-blue-950 border-blue-900 text-blue-400'
                              }`}>
                                {appliedRecord.status}
                              </span>
                            ) : isExpired ? (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-gray-850 border border-gray-800 text-gray-500 px-3.5 py-1.5 rounded-xl">
                                Expired
                              </span>
                            ) : !eligibility.eligible ? (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-950/20 border border-rose-900/30 text-rose-400 px-3 py-1.5 rounded-xl max-w-xs block text-center" title={eligibility.reason}>
                                Ineligible
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApply(d._id)}
                                disabled={applyingId === d._id}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-950 cursor-pointer disabled:opacity-50"
                              >
                                {applyingId === d._id ? "Applying..." : "Apply Now"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[10px] bg-gray-950/40 p-3 rounded-xl border border-gray-855">
                          <div>
                            <span className="text-gray-505 block font-bold">Min CGPA Threshold</span>
                            <strong className="text-white font-extrabold font-mono">{d.minCgpa.toFixed(2)}</strong>
                          </div>
                          <div>
                            <span className="text-gray-550 block font-bold">Branches Allowed</span>
                            <strong className="text-white font-extrabold truncate block">{d.eligibleBranches.join(", ") || "All"}</strong>
                          </div>
                          <div>
                            <span className="text-gray-550 block font-bold">Deadline Date</span>
                            <strong className={`font-mono font-extrabold ${isExpired ? "text-rose-400" : "text-gray-300"}`}>
                              {new Date(d.deadline).toLocaleDateString()}
                            </strong>
                          </div>
                        </div>

                        {!eligibility.eligible && !appliedRecord && (
                          <p className="text-[10px] text-rose-400 italic font-semibold leading-normal bg-rose-950/10 p-2.5 rounded-lg border border-rose-900/20">
                            * {eligibility.reason}
                          </p>
                        )}

                        {d.eligibilityCriteria && (
                          <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{d.eligibilityCriteria}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Student Applications tracker (1 column) */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
                My Applications
              </h2>

              <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="border-b border-gray-805 pb-3">
                  <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest">Active Applications</h3>
                </div>

                {applications.length === 0 ? (
                  <p className="text-xs text-gray-500 italic font-medium py-6 text-center">You have not submitted any applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      const d = app.driveId || {};
                      
                      return (
                        <div key={app._id} className="p-3.5 bg-gray-950/40 border border-gray-855 rounded-xl space-y-2.5 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold block">{d.companyName}</span>
                            <h4 className="font-extrabold text-white leading-normal">{d.jobRole}</h4>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-gray-850">
                            <span className="text-[9px] text-gray-505 font-mono">{new Date(app.appliedAt).toLocaleDateString()}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              app.status === 'Shortlisted' ? 'bg-emerald-950 text-emerald-400' : app.status === 'Rejected' ? 'bg-rose-950 text-rose-455' : 'bg-blue-950 text-blue-400'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default PlacementDrives;
