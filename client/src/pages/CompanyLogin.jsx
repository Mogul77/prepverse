import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function CompanyLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/company/login", formData);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.company));
      
      setLoading(false);
      navigate("/company/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 text-gray-300 font-sans p-6">
      <div className="bg-gray-900 border border-gray-850 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span className="w-3 h-5 bg-blue-500 rounded-sm"></span>
            Recruiter Login
          </h1>
          <p className="text-xs text-gray-500">Access your placement drive manager workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Recruiter Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="recruiter@company.com"
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-900 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center space-y-3 pt-3 border-t border-gray-850">
          <p className="text-xs text-gray-500">
            A recruiting company?{" "}
            <Link to="/company/register" className="text-blue-400 font-bold hover:underline">
              Register Here
            </Link>
          </p>
          <p className="text-xs">
            <Link to="/" className="text-gray-400 hover:text-white font-semibold transition-colors">
              &larr; Back to Student Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompanyLogin;
