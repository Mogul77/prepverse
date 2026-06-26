import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await axios.get(
        `http://localhost:5000/api/results/${user._id}`
      );

      setResults(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          📊 My MCQ Results
        </h1>
        <div className="flex gap-3">
          <Link to="/dashboard" className="px-4 py-2 bg-gray-650 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-all">
            Dashboard
          </Link>
          <Link to="/coding-results" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow">
            View Coding Submissions
          </Link>
        </div>
      </div>

      {/* EMPTY STATE */}
      {results.length === 0 ? (
        <p className="text-gray-600">
          No results yet. Start your first test 🚀
        </p>
      ) : (
        <div className="grid gap-6">

          {/* RESULT CARDS */}
          {results.map((result) => {
            const percentage = Math.round(
              (result.score / result.total) * 100
            );

            return (
              <div
                key={result._id}
                className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
              >

                {/* TOP SECTION */}
                <div className="flex justify-between items-center">

                  <h2 className="text-xl font-bold text-gray-800">
                    {result.testName}
                  </h2>

                  {/* PASS / FAIL BADGE */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      percentage >= 50
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {percentage >= 50 ? "PASS 🟢" : "FAIL 🔴"}
                  </span>

                </div>

                {/* SCORE */}
                <div className="mt-4">
                  <p className="text-lg">
                    Score:{" "}
                    <span className="font-bold">
                      {result.score} / {result.total}
                    </span>
                  </p>

                  <p className="text-lg">
                    Percentage:{" "}
                    <span className="font-bold">
                      {percentage}%
                    </span>
                  </p>
                </div>

                {/* DATE */}
                <p className="text-sm text-gray-500 mt-3">
                  Attempted on:{" "}
                  {new Date(result.createdAt).toLocaleString()}
                </p>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Results;