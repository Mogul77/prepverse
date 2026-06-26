import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ManageCompanies() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

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

    fetchCompanies(token);
  }, [navigate]);

  const fetchCompanies = async (token) => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get("http://localhost:5000/api/company/admin/companies", config);
      setCompanies(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load corporate directory.");
      setLoading(false);
    }
  };

  const handleApprove = async (companyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(`http://localhost:5000/api/company/admin/approve/${companyId}`, {}, config);
      fetchCompanies(token);
      alert("Recruiting partner approved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to approve recruiter: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (companyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to reject/suspend this company? All related placement drives will be deleted.")) {
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.delete(`http://localhost:5000/api/company/admin/reject/${companyId}`, config);
      fetchCompanies(token);
      alert("Company record removed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to remove company: " + (err.response?.data?.message || err.message));
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
        <p className="text-gray-400 font-semibold animate-pulse font-mono text-sm">Retrieving recruiters registry...</p>
      </div>
    );
  }

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
                  <Link to="/admin/companies" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-855 transition-all">
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
              <p className="text-[10px] text-gray-505 truncate">{user?.role}</p>
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
            <span className="w-2 h-4 bg-emerald-500 rounded-sm"></span>
            Manage Corporate Recruiting Partners
          </h1>
          <div className="text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
            Admin Portal
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
          
          <div className="bg-gray-900 border border-gray-855 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-black text-white">Registered Corporate Recruiters</h2>
              <p className="text-xs text-gray-500">Review pending recruiters, approve access, or suspend partnerships.</p>
            </div>

            {companies.length === 0 ? (
              <p className="text-xs text-gray-500 italic font-semibold py-8 text-center">No corporate recruiting partners registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-805 text-[9px] uppercase font-black tracking-wider text-gray-500 bg-gray-950/40">
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4 text-center">Approval Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-855 text-xs">
                    {companies.map((company) => (
                      <tr key={company._id} className="hover:bg-gray-850/10">
                        <td className="py-3.5 px-4 font-bold text-white">{company.name}</td>
                        <td className="py-3.5 px-4 text-gray-400 font-mono">{company.email}</td>
                        <td className="py-3.5 px-4 text-gray-400 font-mono">
                          {company.website ? (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-450 hover:underline">
                              {company.website}
                            </a>
                          ) : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            company.isApproved ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-955 text-amber-400'
                          }`}>
                            {company.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {!company.isApproved && (
                            <button
                              onClick={() => handleApprove(company._id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all shadow cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(company._id)}
                            className="px-3 py-1 bg-red-650 hover:bg-red-750 text-white rounded text-[10px] font-bold transition-all shadow cursor-pointer"
                          >
                            {company.isApproved ? 'Suspend' : 'Reject'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default ManageCompanies;
