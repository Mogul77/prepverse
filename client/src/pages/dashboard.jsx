import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [deptForm, setDeptForm] = useState("");
  const [branchForm, setBranchForm] = useState("");
  const [cgpaForm, setCgpaForm] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchDashboardStats(token);
  }, [navigate]);

  const fetchDashboardStats = async (token) => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get("http://localhost:5000/api/dashboard/student-stats", config);
      setStats(res.data);
      
      // Initialize form values from response profile details
      setDeptForm(res.data.profile.department || "");
      setBranchForm(res.data.profile.branch || "");
      setCgpaForm(res.data.profile.cgpa?.toString() || "0");
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setError("Failed to compile dashboard metrics.");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setUpdatingProfile(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.post("http://localhost:5000/api/dashboard/profile", {
        department: deptForm,
        branch: branchForm,
        cgpa: parseFloat(cgpaForm) || 0
      }, config);
      
      // Update local storage user information
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      
      // Refresh dashboard stats to pull updated summary
      await fetchDashboardStats(token);
      setIsEditingProfile(false);
      setUpdatingProfile(false);
      alert("Profile Summary Updated!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
      setUpdatingProfile(false);
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
        <p className="text-gray-400 font-semibold animate-pulse font-mono text-sm">Compiling placement metrics...</p>
      </div>
    );
  }

  // Draw custom SVG chart coordinates
  const renderSVGChart = () => {
    if (!stats?.chartData || stats.chartData.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500 text-xs italic font-semibold">
          Attempt assessments to visualize performance trends.
        </div>
      );
    }

    const chartPoints = stats.chartData;
    const padding = 40;
    const width = 500;
    const height = 180;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate chart positions
    const pointsCount = chartPoints.length;
    const xStep = pointsCount > 1 ? chartWidth / (pointsCount - 1) : chartWidth;
    
    let pathData = "";
    chartPoints.forEach((pt, idx) => {
      const x = padding + idx * xStep;
      // Score maps 0-100 to chartHeight-0 (y goes down in SVG)
      const y = padding + chartHeight - (pt.score / 100) * chartHeight;
      if (idx === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px] h-full">
          {/* Y Axis Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                <text x={padding - 10} y={y + 4} fill="#6b7280" fontSize="8" textAnchor="end" fontFamily="monospace">{val}%</text>
              </g>
            );
          })}

          {/* Line Path */}
          {chartPoints.length > 1 && (
            <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Markers / Circles */}
          {chartPoints.map((pt, idx) => {
            const x = padding + idx * xStep;
            const y = padding + chartHeight - (pt.score / 100) * chartHeight;
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2.5" className="cursor-pointer hover:r-5 transition-all" />
                <text x={x} y={y - 8} fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{pt.score}%</text>
                <text x={x} y={height - padding + 15} fill="#9ca3af" fontSize="7" textAnchor="middle" transform={`rotate(-15, ${x}, ${height - padding + 15})`}>
                  {pt.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-850 p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-8">
            <span className="w-3 h-5 bg-blue-500 rounded-sm"></span>
            PrepVerse
          </h2>
          <ul className="space-y-3">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-850 transition-all">
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
              <Link to="/placement-drives" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
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
                  <Link to="/admin/companies" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                    Manage Companies
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
            <button onClick={handleLogout} className="text-xs font-bold text-red-400">Logout</button>
          </div>
          <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-500 rounded-sm"></span>
            Student Dashboard
          </h1>
          <div className="text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-900">
            Active Student Portal
          </div>
        </header>

        {/* Content Panel */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
          
          {/* Welcome Card & Profile Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Welcome message */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-900/60 to-indigo-905/60 border border-blue-800/20 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[160px]">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Welcome Back, {user?.name}!</h2>
                <p className="text-xs text-blue-200 leading-relaxed max-w-md">
                  Track your evaluation stats, attempt pending tests, analyze MCQ & Coding scores, and benchmark your progress against placement-ready criteria.
                </p>
              </div>
              <div className="flex gap-2.5 pt-4">
                <Link to="/tests" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-950 text-center">
                  Start New Test
                </Link>
                <Link to="/leaderboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-xl text-xs font-bold border border-gray-700 transition-all text-center">
                  View Rankings
                </Link>
              </div>
            </div>

            {/* Profile Summary Widget */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Profile Summary</h3>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-500 font-medium">Department</span>
                      <strong className="text-gray-250 font-bold">{stats?.profile?.department || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-500 font-medium">Branch</span>
                      <strong className="text-gray-250 font-bold">{stats?.profile?.branch || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Current CGPA</span>
                      <strong className="text-emerald-400 font-bold">{stats?.profile?.cgpa?.toFixed(2) || "0.00"}</strong>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-black tracking-wider block mb-1">Dept</label>
                        <input
                          type="text"
                          required
                          value={deptForm}
                          onChange={(e) => setDeptForm(e.target.value)}
                          placeholder="e.g. CSE"
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1 px-2.5 text-xs text-gray-300 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-black tracking-wider block mb-1">Branch</label>
                        <input
                          type="text"
                          required
                          value={branchForm}
                          onChange={(e) => setBranchForm(e.target.value)}
                          placeholder="e.g. B.Tech"
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1 px-2.5 text-xs text-gray-300 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-black tracking-wider block mb-1">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        required
                        value={cgpaForm}
                        onChange={(e) => setCgpaForm(e.target.value)}
                        placeholder="e.g. 8.75"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1 px-2.5 text-xs text-gray-300 outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow"
                    >
                      {updatingProfile ? "Saving..." : "Save Details"}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Aggregate metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Completed Tests</span>
              <div className="text-2xl font-black text-blue-400">{stats?.completedCount}</div>
            </div>
            
            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Pending Tests</span>
              <div className="text-2xl font-black text-amber-500">{stats?.pendingCount}</div>
            </div>

            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Average Score</span>
              <div className="text-2xl font-black text-emerald-400">{stats?.averageScore.toFixed(1)}%</div>
            </div>

            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Highest Score</span>
              <div className="text-2xl font-black text-purple-400">{stats?.highestScore.toFixed(1)}%</div>
            </div>

          </div>

          {/* Breakdown Stats & Trends Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Stats Breakdown */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3">Test Breakdown</h3>
              
              {/* MCQ Stats */}
              <div className="space-y-2">
                <span className="text-xs font-black text-emerald-400 block">MCQ Assessments</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-gray-950/40 p-2.5 rounded-xl border border-gray-850">
                  <div>
                    <span className="text-gray-500 font-bold block">Attempted</span>
                    <strong className="text-white font-extrabold text-xs font-mono">{stats?.mcqStats?.attempted}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block">Avg. Score</span>
                    <strong className="text-white font-extrabold text-xs font-mono">{stats?.mcqStats?.average.toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block">Highest</span>
                    <strong className="text-white font-extrabold text-xs font-mono">{stats?.mcqStats?.highest.toFixed(0)}%</strong>
                  </div>
                </div>
              </div>

              {/* Coding Stats */}
              <div className="space-y-2">
                <span className="text-xs font-black text-purple-400 block">Coding Assessments</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-gray-950/40 p-2.5 rounded-xl border border-gray-850">
                  <div>
                    <span className="text-gray-500 font-bold block">Attempted</span>
                    <strong className="text-white font-extrabold text-xs font-mono">{stats?.codingStats?.attempted}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block">Avg. Score</span>
                    <strong className="text-white font-extrabold text-xs font-mono">{stats?.codingStats?.average.toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block">Highest</span>
                    <strong className="text-white font-extrabold text-xs font-mono">{stats?.codingStats?.highest.toFixed(0)}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Graph Panel */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-gray-805 pb-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Performance Graph</h3>
                <span className="text-[10px] font-black text-blue-400 uppercase font-mono tracking-wider">Score Trend Chart</span>
              </div>
              
              <div className="flex-1 flex items-center py-4">
                {renderSVGChart()}
              </div>
            </div>

          </div>

          {/* Recent results and upcoming tests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Results List */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Recent Results</h3>
                
                {stats?.recentResults && stats.recentResults.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentResults.map((r) => (
                      <div key={r._id} className="p-3 bg-gray-950/40 border border-gray-850 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white leading-normal">{r.testName}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded block w-max mt-1 ${
                            r.type === 'coding' ? 'bg-purple-950 border-purple-900 text-purple-400' : 'bg-emerald-950 border-emerald-900 text-emerald-400'
                          }`}>
                            {r.type === 'coding' ? "Coding" : "MCQ"}
                          </span>
                        </div>
                        <div className="text-right">
                          <strong className="text-blue-400 font-extrabold block font-mono text-sm">{r.percentage.toFixed(0)}%</strong>
                          <span className="text-[9px] text-gray-500 font-bold block">{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic font-medium py-4 text-center">No recent results logged.</p>
                )}
              </div>
            </div>

            {/* Upcoming Tests & Quick actions */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Pending / Upcoming Assessments</h3>

                {stats?.upcomingTests && stats.upcomingTests.length > 0 ? (
                  <div className="space-y-2">
                    {stats.upcomingTests.map((t) => (
                      <div key={t._id} className="p-3 bg-gray-950/40 border border-gray-850 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white leading-normal">{t.title}</p>
                          <span className="text-[9px] text-gray-500 font-bold block mt-1">Duration: {t.duration} mins</span>
                        </div>
                        <Link 
                          to={t.testType === "mcq" ? `/test/${t._id}` : `/coding-test/${t._id}`} 
                          className="px-3 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-[10px] uppercase font-black tracking-wider transition-all"
                        >
                          Start Test
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic font-medium py-4 text-center">All available assessments completed!</p>
                )}
              </div>
            </div>

          </div>

          {/* Activity Feed */}
          <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Recent Placement Activity</h3>
            
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3 font-mono text-[11px] text-gray-450 leading-relaxed">
                {stats.recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 border-b border-gray-850 pb-2">
                    <span className="text-blue-500 font-black shrink-0">&gt;</span>
                    <div className="flex-1 flex justify-between items-baseline gap-4">
                      <span>{act.message}</span>
                      <span className="text-[9px] text-gray-550 shrink-0">{new Date(act.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic font-medium py-4 text-center">No activity logged.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;