import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";

function CodingResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState(0);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (id) {
      // Fetch single assessment result
      const fetchSingleResult = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:5000/api/coding-results/${id}`);
          setResult(res.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching single coding result:", err);
          setError("Failed to load submission details.");
          setLoading(false);
        }
      };
      fetchSingleResult();
    } else {
      // Fetch all results for student
      const fetchStudentResults = async () => {
        try {
          setLoading(true);
          const studentId = user._id;
          if (!studentId) {
            setError("User not authenticated.");
            setLoading(false);
            return;
          }
          const res = await axios.get(`http://localhost:5000/api/coding-results/student/${studentId}`);
          setAllResults(res.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching student coding results:", err);
          setError("Failed to load coding results.");
          setLoading(false);
        }
      };
      fetchStudentResults();
    }
  }, [id, user._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-8 text-gray-300">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-semibold animate-pulse font-mono text-sm">Retrieving coding results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-8 text-center text-gray-300">
        <div className="w-16 h-16 bg-red-950 border border-red-900 rounded-full flex items-center justify-center mb-6 text-red-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-200 mb-2">Error Occurred</h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error}</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-900">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 1: SINGLE CODING ASSESSMENT RESULT DETAILS
  // ----------------------------------------------------
  if (id && result) {
    const testName = result.testId?.title || "Coding Assessment";
    const totalScore = result.totalScore;
    const percentage = result.percentage || 0;
    const attemptedCount = result.attemptedQuestions;
    const unattemptedCount = result.unattemptedQuestions;
    const passedCount = result.passedQuestions;
    const failedCount = result.failedQuestions;

    return (
      <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex flex-col">
        {/* Header Panel */}
        <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
            <span className="text-gray-700 font-mono">|</span>
            <div>
              <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-500 rounded-sm"></span>
                Assessment Submission Details
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
              Coding Assessment
            </span>
          </div>
        </header>

        {/* Main Details Panel */}
        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
          
          {/* Assessment Header */}
          <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Evaluation Report
              </span>
              <h2 className="text-2xl font-black text-white">{testName}</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed italic">
              Completed by: <strong className="text-gray-200">{result.studentName}</strong> on {new Date(result.submittedAt || result.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 border border-gray-850 p-5 rounded-2xl text-center flex flex-col justify-center items-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Total Score</span>
              <div className="text-xl font-extrabold text-blue-400 capitalize">{totalScore}</div>
              <span className="text-[9px] text-gray-600 mt-1 font-mono">Accumulated</span>
            </div>

            <div className="bg-gray-900/60 border border-gray-850 p-5 rounded-2xl text-center flex flex-col justify-center items-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Accuracy</span>
              <div className="text-xl font-extrabold text-emerald-400">{percentage.toFixed(1)}%</div>
              <span className="text-[9px] text-gray-600 mt-1 font-mono">Test Cases Passed</span>
            </div>

            <div className="bg-gray-900/60 border border-gray-850 p-5 rounded-2xl text-center flex flex-col justify-center items-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Questions Attempted</span>
              <div className="text-xl font-extrabold text-sky-400">{attemptedCount} / {result.totalQuestions}</div>
              <span className="text-[9px] text-gray-600 mt-1 font-mono">{unattemptedCount} Unattempted</span>
            </div>

            <div className="bg-gray-900/60 border border-gray-850 p-5 rounded-2xl text-center flex flex-col justify-center items-center shadow-lg transition-transform hover:scale-102 duration-300">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Passed / Failed</span>
              <div className="text-xl font-extrabold text-purple-400">{passedCount} / {failedCount}</div>
              <span className="text-[9px] text-gray-600 mt-1 font-mono">Passed All Test Cases</span>
            </div>
          </div>

          {/* Question-wise results accordion or tabs */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
              Question-wise Evaluation
            </h3>
            
            {/* Tabs for switching between questions */}
            <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
              {result.answers.map((ans, idx) => {
                const qTitle = ans.questionId?.title || `Question ${idx + 1}`;
                const isSelected = activeQuestionTab === idx;
                const statusColor = ans.attempted
                  ? (ans.passedTestCases === ans.totalTestCases ? "text-emerald-400 bg-emerald-950/40 border-emerald-900" : "text-amber-400 bg-amber-950/40 border-amber-900")
                  : "text-rose-400 bg-rose-950/40 border-rose-900";

                return (
                  <button
                    key={ans._id}
                    onClick={() => setActiveQuestionTab(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900"
                        : `bg-gray-900 text-gray-400 border-gray-850 hover:bg-gray-800`
                    }`}
                  >
                    <span>{idx + 1}. {qTitle}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      ans.attempted 
                        ? (ans.passedTestCases === ans.totalTestCases ? "bg-emerald-500" : "bg-amber-500")
                        : "bg-rose-500"
                    }`}></span>
                  </button>
                );
              })}
            </div>

            {/* Selected Question Details */}
            {result.answers[activeQuestionTab] && (
              <div className="bg-gray-900 border border-gray-850 rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6">
                {(() => {
                  const ans = result.answers[activeQuestionTab];
                  const q = ans.questionId || {};
                  
                  return (
                    <>
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-gray-800">
                        <div>
                          <h4 className="text-lg font-black text-white">{q.title || "Coding Challenge"}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-1.5 ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                              : q.difficulty === 'Medium'
                                ? 'bg-amber-950 text-amber-400 border-amber-900'
                                : 'bg-rose-950 text-rose-400 border-rose-900'
                          }`}>
                            {q.difficulty || "Easy"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <div className="bg-gray-950/60 p-2 px-4 rounded-xl border border-gray-850">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Attempted</span>
                            <span className={`text-xs font-black ${ans.attempted ? "text-emerald-400" : "text-rose-450"}`}>
                              {ans.attempted ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="bg-gray-950/60 p-2 px-4 rounded-xl border border-gray-850">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Passed Cases</span>
                            <span className="text-xs font-black text-emerald-400">
                              {ans.passedTestCases} / {ans.totalTestCases}
                            </span>
                          </div>
                          <div className="bg-gray-950/60 p-2 px-4 rounded-xl border border-gray-850">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Time Taken</span>
                            <span className="text-xs font-black text-sky-400">
                              {ans.executionTime}s
                            </span>
                          </div>
                          <div className="bg-gray-950/60 p-2 px-4 rounded-xl border border-gray-850">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Memory</span>
                            <span className="text-xs font-black text-purple-400">
                              {ans.memory} KB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Question Description */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Problem Description</span>
                        <p className="text-sm text-gray-355 leading-relaxed whitespace-pre-wrap">{q.description}</p>
                      </div>

                      {/* Submitted Source Code */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submitted Code ({ans.language})</span>
                          {ans.attempted && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ans.sourceCode);
                                alert("Source code copied!");
                              }}
                              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                              Copy Code
                            </button>
                          )}
                        </div>

                        {ans.attempted ? (
                          <div className="border border-gray-850 rounded-2xl overflow-hidden bg-gray-950">
                            <Editor
                              height="300px"
                              language={ans.language}
                              value={ans.sourceCode}
                              theme="vs-dark"
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                domReadOnly: true,
                                wordWrap: 'on',
                                automaticLayout: true
                              }}
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-950/40 border border-gray-850 rounded-2xl p-8 text-center text-gray-500 text-xs font-medium italic">
                            Question was not attempted. No source code submitted.
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: LIST OF ALL CODING SUBMISSIONS
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-850 p-5 flex flex-col justify-between hidden md:flex">
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
              <Link to="/coding-results" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-800 transition-all">
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
        
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-650 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user.name ? user.name[0] : 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/dashboard" className="text-xs font-bold text-blue-400">Dashboard</Link>
          </div>
          <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-500 rounded-sm"></span>
            Coding Submissions
          </h1>
          <div className="text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
            Student Portal
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
          <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-black text-white mb-1">Attempted Coding Assessments</h2>
            <p className="text-xs text-gray-500 mb-6">Review your source code evaluation metrics, overall accuracy ratios, and performance scoring logs.</p>

            {allResults.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-800 rounded-xl">
                <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-sm font-bold text-gray-400 mb-1">No Submissions Recorded</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto mb-6">You have not completed any coding assessments yet. Results are logged when submitting your overall assessment.</p>
                <Link to="/tests" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow">
                  Browse Available Tests
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] uppercase font-black tracking-wider text-gray-500">
                      <th className="pb-3 pr-4">Assessment Test Name</th>
                      <th className="pb-3 px-4 text-center">Duration</th>
                      <th className="pb-3 px-4 text-center">Attempted Questions</th>
                      <th className="pb-3 px-4 text-center">Overall Accuracy</th>
                      <th className="pb-3 px-4 text-center">Score</th>
                      <th className="pb-3 px-4 text-right">Date</th>
                      <th className="pb-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850 text-xs">
                    {allResults.map((res) => {
                      const tName = res.testId?.title || "Coding Assessment";
                      const duration = res.testId?.duration || 0;
                      
                      return (
                        <tr key={res._id} className="hover:bg-gray-800/30 transition-colors group">
                          <td className="py-4 pr-4 font-bold text-white group-hover:text-blue-400 transition-colors">{tName}</td>
                          <td className="py-4 px-4 text-center text-gray-400">{duration} mins</td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-gray-400">{res.attemptedQuestions} / {res.totalQuestions}</td>
                          <td className="py-4 px-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.percentage === 100 
                                ? 'bg-emerald-950 text-emerald-400' 
                                : res.percentage > 0 
                                  ? 'bg-amber-950 text-amber-400' 
                                  : 'bg-rose-950 text-rose-400'
                            }`}>
                              {res.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-gray-200">{res.totalScore}</td>
                          <td className="py-4 px-4 text-right text-gray-500 font-mono">
                            {new Date(res.submittedAt || res.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <Link to={`/coding-result/${res._id}`} className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-900/40 text-blue-400 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all">
                              Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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

export default CodingResultPage;
