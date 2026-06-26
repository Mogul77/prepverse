import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminAnalytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role !== "admin" && parsedUser.role !== "superadmin") {
      navigate("/dashboard");
      return;
    }

    fetchAdminStats(token);
  }, [navigate]);

  const fetchAdminStats = async (token) => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get("http://localhost:5000/api/dashboard/admin-stats", config);
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Failed to fetch admin analytics data.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Render SVG Bar Chart for Score Ranges (under 40, 40-70, above 70)
  const renderBarChart = () => {
    if (!stats?.scoreRanges) return null;
    const { under40, range40to70, above70 } = stats.scoreRanges;
    const maxVal = Math.max(under40, range40to70, above70, 1);
    
    const data = [
      { label: "< 40%", count: under40, color: "#f87171" },
      { label: "40% - 70%", count: range40to70, color: "#fbbf24" },
      { label: "> 70%", count: above70, color: "#34d399" }
    ];

    const width = 300;
    const height = 150;
    const barWidth = 40;
    const gap = 35;
    const paddingLeft = 50;
    const paddingTop = 20;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const val = Math.round(maxVal * ratio);
          const y = height - 30 - ratio * (height - 50);
          return (
            <g key={ratio}>
              <line x1={paddingLeft} y1={y} x2={width - 20} y2={y} stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
              <text x={paddingLeft - 8} y={y + 3} fill="#9ca3af" fontSize="8" textAnchor="end" fontFamily="monospace">{val}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const barHeight = (item.count / maxVal) * (height - 50);
          const x = paddingLeft + idx * (barWidth + gap) + 15;
          const y = height - 30 - barHeight;

          return (
            <g key={idx}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={item.color} rx="4" />
              <text x={x + barWidth / 2} y={y - 5} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {item.count}
              </text>
              <text x={x + barWidth / 2} y={height - 15} fill="#9ca3af" fontSize="8" textAnchor="middle">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render SVG Pie Donut Ring for Pass/Fail ratio
  const renderDonutChart = () => {
    if (!stats) return null;
    const pass = Math.round(stats.passPercentage);
    const fail = Math.round(stats.failPercentage);

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pass / 100) * circumference;

    return (
      <div className="flex items-center justify-around w-full gap-4">
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#1f2937" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
          <text x="50" y="55" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle" fontFamily="monospace">
            {pass}%
          </text>
        </svg>

        <div className="text-xs space-y-1.5 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
            <span className="text-gray-400">Pass Ratio (&gt;= 50%):</span>
            <strong className="text-emerald-400 font-bold">{pass}%</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
            <span className="text-gray-400">Fail Ratio (&lt; 50%):</span>
            <strong className="text-red-400 font-bold">{fail}%</strong>
          </div>
        </div>
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

            {/* Admin Only Navigation */}
            {user?.role === "admin" && (
              <>
                <li className="pt-4 border-t border-gray-800">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-4">Admin Console</span>
                </li>
                <li>
                  <Link to="/admin-analytics" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-850 transition-all">
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
              {user?.name ? user.name[0] : 'A'}
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

      {/* Main Panel Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/dashboard" className="text-xs font-bold text-blue-400">Dashboard</Link>
          </div>
          <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
            <span className="w-2 h-4 bg-emerald-500 rounded-sm"></span>
            Portal Analytics Dashboard
          </h1>
          <div className="text-[10px] font-black uppercase tracking-wider bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900">
            System Administration
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
          
          {/* Key Aggregates Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Total Registered Students</span>
              <div className="text-2xl font-black text-blue-400">{stats?.totalStudents}</div>
            </div>

            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Total Assessments</span>
              <div className="text-2xl font-black text-purple-400">{stats?.totalTests}</div>
              <span className="text-[9px] text-gray-600 mt-1 block">({stats?.mcqTests} MCQ | {stats?.codingTests} Coding)</span>
            </div>

            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Completed Attempts</span>
              <div className="text-2xl font-black text-emerald-400">{stats?.totalAttempts}</div>
            </div>

            <div className="bg-gray-900 border border-gray-850 p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1.5">Average Performance</span>
              <div className="text-2xl font-black text-amber-500">{stats?.averageScore.toFixed(1)}%</div>
              <span className="text-[9px] text-gray-600 mt-1 block">(Highest: {stats?.highestScore.toFixed(0)}% | Lowest: {stats?.lowestScore.toFixed(0)}%)</span>
            </div>

          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Score Ranges Bar Chart */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Score Distribution</h3>
              <div className="flex-1 flex items-center justify-center min-h-[160px]">
                {renderBarChart()}
              </div>
            </div>

            {/* Pass / Fail Donut chart */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Assessment Outcomes</h3>
              <div className="flex-1 flex items-center justify-center min-h-[160px]">
                {renderDonutChart()}
              </div>
            </div>

          </div>

          {/* Performance Data: Top Performers & Recent Attempts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Performers Card */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between lg:col-span-1">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Top Performers</h3>
                
                {stats?.topPerformers && stats.topPerformers.length > 0 ? (
                  <div className="space-y-3.5">
                    {stats.topPerformers.map((perf, index) => (
                      <div key={index} className="flex items-center gap-3 text-xs border-b border-gray-855 pb-2 last:border-b-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-400" : index === 1 ? "bg-slate-400/20 text-slate-300" : "bg-amber-700/20 text-amber-500"
                        }`}>
                          {index + 1}
                        </span>
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-white truncate leading-normal">{perf.name}</p>
                          <span className="text-[9px] text-gray-500 font-bold block">{perf.department}</span>
                        </div>
                        <strong className="text-blue-400 font-extrabold text-xs shrink-0 font-mono">{perf.score} pts</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic font-medium py-4 text-center">No student performance recorded.</p>
                )}
              </div>
            </div>

            {/* Recent Submissions List */}
            <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between lg:col-span-2">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-3 mb-4">Recent Attempts Summary</h3>

                {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-805 text-[9px] uppercase font-black tracking-wider text-gray-500">
                          <th className="pb-2">Student</th>
                          <th className="pb-2">Test Type</th>
                          <th className="pb-2 text-center">Score</th>
                          <th className="pb-2 text-center">Accuracy</th>
                          <th className="pb-2 text-right">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-855 text-xs">
                        {stats.recentSubmissions.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-gray-850/10">
                            <td className="py-2.5 font-bold text-white">{sub.studentName}</td>
                            <td className="py-2.5 text-gray-400">{sub.testName}</td>
                            <td className="py-2.5 text-center font-mono font-bold text-blue-400">{sub.score}</td>
                            <td className="py-2.5 text-center font-mono text-emerald-500">{sub.percentage.toFixed(0)}%</td>
                            <td className="py-2.5 text-right text-gray-500 font-mono text-[10px]">
                              {new Date(sub.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic font-medium py-4 text-center">No attempts submitted recently.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default AdminAnalytics;
