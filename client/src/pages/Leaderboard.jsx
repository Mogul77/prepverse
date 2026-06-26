import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Leaderboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overall"); // "overall" | "mcq" | "coding" | "test"
  
  // Data State
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Load User & Fetch Initial Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(storedUser));

    // Fetch tests list for dropdown
    const fetchTests = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const res = await axios.get("http://localhost:5000/api/tests", config);
        setTests(res.data);
        if (res.data.length > 0) {
          setSelectedTestId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching tests list:", err);
      }
    };

    fetchTests();
  }, [navigate]);

  // Fetch Leaderboard data on tab/test selection change
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        let endpoint = "overall";
        if (activeTab === "mcq") endpoint = "mcq";
        else if (activeTab === "coding") endpoint = "coding";
        else if (activeTab === "test" && selectedTestId) endpoint = `test/${selectedTestId}`;
        
        // Wait for selectedTestId if we are on test tab
        if (activeTab === "test" && !selectedTestId) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/leaderboard/${endpoint}`, config);
        setLeaderboardData(res.data);
        setCurrentPage(1); // Reset page on tab/data change
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError("Failed to retrieve rankings database.");
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [activeTab, selectedTestId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Filter and search
  const filteredData = leaderboardData.filter((entry) => {
    const nameMatch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch = (entry.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || deptMatch;
  });

  // Pagination calculation
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

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
              <Link to="/leaderboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-850 transition-all">
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
          <button onClick={handleLogout} className="w-full py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/dashboard" className="text-xs font-bold text-blue-400">Dashboard</Link>
          </div>
          <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-500 rounded-sm"></span>
            Performance Leaderboard
          </h1>
          <div className="text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
            Student Rankings
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
          
          {/* Filters and Tab Navigation bar */}
          <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-850">
              <button
                onClick={() => { setActiveTab("overall"); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overall" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                Overall
              </button>
              <button
                onClick={() => { setActiveTab("mcq"); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "mcq" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                MCQ Tests
              </button>
              <button
                onClick={() => { setActiveTab("coding"); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "coding" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                Coding Tests
              </button>
              <button
                onClick={() => { setActiveTab("test"); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "test" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                Test-wise
              </button>
            </div>

            {/* Test Selection Dropdown (Only for Test-wise tab) */}
            {activeTab === "test" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold">Select Test:</span>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold py-1.5 px-3 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  {tests.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.testType === "mcq" ? "MCQ" : "Coding"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <div className="w-full md:w-64 relative">
              <input
                type="text"
                placeholder="Search name or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
              />
              <svg className="w-4 h-4 text-gray-600 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

          </div>

          {/* Leaderboard Table Container */}
          <div className="bg-gray-900 border border-gray-850 rounded-2xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs text-gray-500 font-semibold font-mono">Compiling rankings database...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-rose-400 italic font-semibold text-xs">
                {error}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-xs font-semibold italic">
                No matching ranking records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] uppercase font-black tracking-wider text-gray-500 bg-gray-950/40">
                      <th className="py-4 px-6 text-center w-16">Rank</th>
                      <th className="py-4 px-4">Student Name</th>
                      <th className="py-4 px-4">Department</th>
                      <th className="py-4 px-4 text-center">MCQ Score</th>
                      <th className="py-4 px-4 text-center">Coding Score</th>
                      <th className="py-4 px-4 text-center">Total Score</th>
                      <th className="py-4 px-4 text-center">Percentage</th>
                      <th className="py-4 px-6 text-right">Latest Sub.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850 text-xs">
                    {currentEntries.map((row) => {
                      // Highlight top 3 ranks
                      let rankStyle = "bg-gray-850 text-gray-300";
                      if (row.rank === 1) rankStyle = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
                      else if (row.rank === 2) rankStyle = "bg-slate-400/20 text-slate-300 border border-slate-400/30";
                      else if (row.rank === 3) rankStyle = "bg-amber-700/20 text-amber-500 border border-amber-700/30";

                      return (
                        <tr key={row.studentId} className="hover:bg-gray-850/20 transition-colors">
                          <td className="py-4 px-6 text-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] mx-auto ${rankStyle}`}>
                              {row.rank}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-white">{row.name}</td>
                          <td className="py-4 px-4 text-gray-400">{row.department}</td>
                          <td className="py-4 px-4 text-center font-mono font-semibold text-emerald-500">{row.mcqScore}</td>
                          <td className="py-4 px-4 text-center font-mono font-semibold text-purple-500">{row.codingScore}</td>
                          <td className="py-4 px-4 text-center font-mono font-black text-blue-400 text-sm">{row.totalScore}</td>
                          <td className="py-4 px-4 text-center font-mono font-bold">
                            {row.percentage.toFixed(1)}%
                          </td>
                          <td className="py-4 px-6 text-right text-gray-500 font-mono text-[10px]">
                            {row.submissionTime ? new Date(row.submissionTime).toLocaleString() : "Never"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls Footer */}
            {filteredData.length > entriesPerPage && (
              <div className="bg-gray-950/30 border-t border-gray-850 px-6 py-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Showing {indexOfFirstEntry + 1} - {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} Students
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="py-1.5 px-3 bg-gray-800 border border-gray-700 hover:bg-gray-750 text-white font-bold rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="flex items-center text-xs font-mono font-black px-2 text-blue-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="py-1.5 px-3 bg-gray-800 border border-gray-700 hover:bg-gray-750 text-white font-bold rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}

export default Leaderboard;
