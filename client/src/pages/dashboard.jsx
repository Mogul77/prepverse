import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="min-h-screen flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-8">
          Placement Portal
        </h1>

        <ul className="space-y-4">

          <li>
            <Link
              to="/dashboard"
              className="hover:text-blue-400"
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/tests"
              className="hover:text-blue-400"
            >
              Tests
            </Link>
          </li>

          <li>
            <Link
              to="/results"
              className="hover:text-blue-400"
            >
              Results
            </Link>
          </li>

          {/* ADMIN ONLY MENU */}
          {user?.role === "admin" && (
            <>
              <li>
                <Link
                  to="/create-test"
                  className="hover:text-green-400"
                >
                  Create Test
                </Link>
              </li>

              <li>
                <Link
                  to="/manage-test"
                  className="hover:text-green-400"
                >
                  Manage Tests
                </Link>
              </li>

              <li>
                <Link
                  to="/students"
                  className="hover:text-green-400"
                >
                  Students
                </Link>
              </li>
            </>
          )}

        </ul>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100">

        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.name}
        </h1>

        {/* ROLE DISPLAY */}
        <p className="text-lg font-semibold text-blue-600 mb-6">
          Role: {user?.role}
        </p>

        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-lg font-semibold">
              Tests Attempted
            </h2>
            <p className="text-3xl mt-2">12</p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-lg font-semibold">
              Average Score
            </h2>
            <p className="text-3xl mt-2">78%</p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-lg font-semibold">
              Rank
            </h2>
            <p className="text-3xl mt-2">25</p>
          </div>

        </div>

        <div className="mt-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-3">
            Subscription Plan
          </h2>

          <p>
            Current Plan:
            <strong> {user?.subscriptionType}</strong>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;