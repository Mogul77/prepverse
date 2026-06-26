import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function CompanyRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
      const res = await axios.post("http://localhost:5000/api/company/register", formData);
      setSuccessMsg(res.data.message);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 text-gray-300 font-sans p-6">
      <div className="bg-gray-900 border border-gray-850 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span className="w-3 h-5 bg-blue-500 rounded-sm"></span>
            Recruiter Register
          </h1>
          <p className="text-xs text-gray-500">Join our placement platform to hire top-performing students</p>
        </div>

        {successMsg ? (
          <div className="bg-emerald-950/40 border border-emerald-900 p-5 rounded-2xl space-y-4 text-center">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs text-emerald-450 leading-relaxed font-bold">{successMsg}</p>
            <Link to="/company/login" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Company Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Google LLC"
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Corporate Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="recruiting@company.com"
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Create Password"
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">Company Website</label>
              <input
                type="url"
                name="website"
                placeholder="https://company.com"
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-1.5">About / Description</label>
              <textarea
                name="description"
                placeholder="Brief summary of company business and tech domain..."
                onChange={handleChange}
                rows="3"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-900 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Registering..." : "Submit Registration"}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-gray-850">
          <p className="text-xs text-gray-500">
            Already registered?{" "}
            <Link to="/company/login" className="text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompanyRegister;
