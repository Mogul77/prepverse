import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

/**
 * TestPage Component
 * A premium, responsive examination interface styled similarly to modern assessment portals.
 */
function TestPage() {
  const { id } = useParams();

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Navigation & Palette State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // ==========================================
  // API INTEGRATIONS & FETCHING
  // ==========================================
  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tests/${id}`
      );

      setTest(res.data);
      setTimeLeft(res.data.duration * 60); // minutes → seconds
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================================
  // TIMER LOGIC (AUTO-SUBMIT ON EXPIRATION)
  // ==========================================
  useEffect(() => {
    if (!timeLeft || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ==========================================
  // USER ACTIONS & SUBMISSION LOGIC
  // ==========================================
  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!test || submitted) return;

    setSubmitted(true);

    let marks = 0;

    // Calculate score based on exact match of correctness
    test.questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        marks++;
      }
    });

    setScore(marks);

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      console.log("User not found in localStorage");
      return;
    }

    // Post details to the backend API
    try {
      const res = await axios.post(
        "http://localhost:5000/api/results",
        {
          userId: user._id,
          testId: id,
          score: marks,
          total: test.questions.length,
        }
      );

      console.log("RESULT SAVED:", res.data);
    } catch (error) {
      console.log(
        "RESULT ERROR:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // HELPER NAVIGATION METHODS
  // ==========================================
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // FORMAT TIME TO mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ==========================================
  // RENDER LOADING STATE
  // ==========================================
  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-semibold animate-pulse">
          Loading assessment details...
        </p>
      </div>
    );
  }

  // Answered questions list mapping
  const answeredCount = test.questions.filter(
    (q) => answers[q._id] !== undefined && answers[q._id] !== ""
  ).length;

  const isTimeUrgent = timeLeft < 300; // less than 5 minutes

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased pb-12 flex flex-col">
      
      {/* ==========================================
          HEADER SECTION
          ========================================== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Portal Brand & Test Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase block">
                Placement Assessment Portal
              </span>
              <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                {test.title}
              </h1>
            </div>
          </div>

          {/* Timer & Question Tracker Info */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {!submitted && (
              <>
                <span className="text-xs sm:text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </span>

                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold shadow-sm transition-all duration-300 ${
                    isTimeUrgent 
                      ? "bg-red-50 border-red-200 text-red-600 animate-pulse shadow-red-50" 
                      : "bg-blue-50 border-blue-100 text-blue-700 shadow-blue-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-mono text-sm sm:text-base tracking-wide">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      {!submitted ? (
        <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* LEFT COLUMN: ACTIVE QUESTION COMPONENT */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[420px] transition-all">
                
                <div>
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Single Option Selection
                    </span>
                  </div>

                  {/* Active Question Title */}
                  <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-6 leading-relaxed">
                    {test.questions[currentQuestionIndex]?.question}
                  </h3>

                  {/* Options List rendered as Premium Selection Cards */}
                  <div className="space-y-3">
                    {test.questions[currentQuestionIndex]?.options.map((opt, i) => {
                      const questionId = test.questions[currentQuestionIndex]?._id;
                      const isSelected = answers[questionId] === opt;
                      
                      return (
                        <div 
                          key={i}
                          onClick={() => handleSelect(questionId, opt)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 cursor-pointer group select-none ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/10 text-blue-900 font-semibold"
                              : "border-gray-200 bg-white hover:bg-gray-50/80 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {/* Circle indicator mimicking a beautiful radio button */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected 
                              ? "border-blue-600 bg-blue-600" 
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}>
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          
                          {/* Option description */}
                          <span className="text-sm sm:text-base leading-snug">
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Question Card Nav Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === test.questions.length - 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: ASSESSMENT METRICS & PALETTE */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Sticky Container for floating alongside questions */}
              <div className="lg:sticky lg:top-[76px] space-y-6">
                
                {/* Progress Indicators Card */}
                <div className="bg-white rounded-2xl border border-gray-200/85 shadow-sm p-5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Completion Metrics
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Answered: {answeredCount}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                        Remaining: {test.questions.length - answeredCount}
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(answeredCount / test.questions.length) * 100}%` }}
                      ></div>
                    </div>

                    <div className="text-[10px] text-gray-400 text-right font-semibold">
                      {((answeredCount / test.questions.length) * 100).toFixed(0)}% Completed
                    </div>
                  </div>
                </div>

                {/* Question Navigation Palette Card */}
                <div className="bg-white rounded-2xl border border-gray-200/85 shadow-sm p-5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Question Palette
                  </h4>
                  
                  <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {test.questions.map((q, index) => {
                      const isCurrent = index === currentQuestionIndex;
                      const isAnswered = answers[q._id] !== undefined && answers[q._id] !== "";
                      
                      let btnClass = "";
                      if (isCurrent) {
                        btnClass = "bg-blue-600 text-white font-bold ring-2 ring-offset-2 ring-blue-500 shadow-sm shadow-blue-100";
                      } else if (isAnswered) {
                        btnClass = "bg-emerald-500 text-white hover:bg-emerald-600 font-semibold";
                      } else {
                        btnClass = "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200";
                      }
                      
                      return (
                        <button
                          key={q._id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`h-9 w-full rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${btnClass}`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Palette Indicators Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-md bg-blue-600 shrink-0"></div>
                      <span>Current</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-md bg-emerald-500 shrink-0"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-md bg-gray-100 border border-gray-200 shrink-0"></div>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>

                {/* Large Submit Button on Desktop Sidebar */}
                <div className="hidden lg:block pt-2">
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Assessment
                  </button>
                </div>

              </div>

            </div>

          </div>
        </main>
      ) : (
        /* ==========================================
            SUCCESS / RESULT SCOREBOARD DASHBOARD
            ========================================== */
        <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-grow">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-8 transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-10 text-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                Assessment Submitted Successfully!
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto">
                Your responses have been successfully compiled, evaluated, and saved to your performance record database.
              </p>
            </div>

            {/* Performance Statistics */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Score Card */}
                <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5 text-center flex flex-col justify-center items-center shadow-sm">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 block">
                    Score Achieved
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-blue-700">
                      {score}
                    </span>
                    <span className="text-gray-400 text-lg font-bold">
                      / {test.questions.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2 font-medium">
                    Correct Responses
                  </span>
                </div>

                {/* Score Percentage Card */}
                <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5 text-center flex flex-col justify-center items-center shadow-sm">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1.5 block">
                    Accuracy Ratio
                  </span>
                  <div className="text-4xl font-black text-emerald-700">
                    {((score / test.questions.length) * 100).toFixed(0)}%
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2 font-medium">
                    Overall Percentage
                  </span>
                </div>

                {/* Assessment Status Card */}
                <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-5 text-center flex flex-col justify-center items-center shadow-sm">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest mb-1.5 block">
                    Database Record
                  </span>
                  <div className="text-sm font-bold text-purple-700 px-4 py-1.5 bg-purple-100/60 rounded-full inline-block mt-1">
                    Saved Successfully
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2.5 font-medium">
                    Result API Logged
                  </span>
                </div>

              </div>

              {/* Action Button to Review Answers */}
              <div className="flex justify-center border-t border-gray-100 pt-6">
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="flex items-center gap-2.5 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showReview ? "Hide Correct Answers" : "Review All Answers & Questions"}
                </button>
              </div>

            </div>
          </div>

          {/* QUESTION REVIEW DRILLDOWN LIST */}
          {showReview && (
            <div className="space-y-6 animate-fadeIn transition-all duration-300">
              <div className="border-b border-gray-200 pb-3 mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Detailed Answer Review Sheet
                </h3>
                <span className="text-xs font-semibold text-gray-500">
                  {test.questions.length} Questions Reviewed
                </span>
              </div>
              
              {test.questions.map((q, index) => {
                const selectedOpt = answers[q._id];
                const isCorrect = selectedOpt === q.correctAnswer;
                const hasAnswered = selectedOpt !== undefined && selectedOpt !== "";
                
                return (
                  <div 
                    key={q._id} 
                    className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
                      !hasAnswered
                        ? "border-gray-200"
                        : isCorrect 
                          ? "border-emerald-200 bg-emerald-50/[0.07]" 
                          : "border-red-200 bg-red-50/[0.07]"
                    }`}
                  >
                    {/* Review Question Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-400">
                        QUESTION {index + 1}
                      </span>
                      
                      {!hasAnswered ? (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Unanswered
                        </span>
                      ) : isCorrect ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Correct Response
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Incorrect Response
                        </span>
                      )}
                    </div>

                    {/* Question Text in Review */}
                    <h4 className="font-bold text-gray-800 text-base mb-4 leading-relaxed">
                      {q.question}
                    </h4>

                    {/* Options Mapping & Accuracy Highlighting */}
                    <div className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isUserSelection = selectedOpt === opt;
                        const isCorrectOption = q.correctAnswer === opt;
                        
                        let optionStyle = "border-gray-100 text-gray-600 bg-gray-50/30";
                        let badgeIcon = null;

                        if (isCorrectOption) {
                          optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm shadow-emerald-50";
                          badgeIcon = (
                            <span className="ml-auto text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                              Correct Answer
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          );
                        } else if (isUserSelection && !isCorrectOption) {
                          optionStyle = "border-red-300 bg-red-50 text-red-900 font-semibold shadow-sm shadow-red-50";
                          badgeIcon = (
                            <span className="ml-auto text-red-600 flex items-center gap-1 text-[11px] font-bold">
                              Your Answer
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          );
                        }

                        return (
                          <div 
                            key={i} 
                            className={`p-3.5 rounded-xl border text-sm sm:text-base flex items-center gap-3 select-none ${optionStyle}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isUserSelection 
                                ? isCorrectOption 
                                  ? "border-emerald-600 bg-emerald-600 text-white" 
                                  : "border-red-500 bg-red-500 text-white"
                                : isCorrectOption
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-gray-300"
                            }`}>
                              {(isUserSelection || isCorrectOption) && (
                                <div className="w-1 h-1 rounded-full bg-white"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium leading-snug">{opt}</span>
                            {badgeIcon}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ==========================================
          MOBILE ACTION BAR (STICKY BOTTOM NAVIGATION)
          ========================================== */}
      {!submitted && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3.5 px-4 flex justify-between items-center gap-3 shadow-2xl z-40 lg:hidden">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow active:bg-emerald-800 transition-all flex items-center justify-center gap-1.5"
          >
            Submit
          </button>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === test.questions.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:bg-blue-700 transition-all"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* ==========================================
          SUBMISSION CONFIRMATION INTERACTIVE MODAL
          ========================================== */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 animate-scaleUp">
            
            {/* Alert Icon */}
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Modal Heading */}
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">
              Submit Your Assessment?
            </h3>
            
            <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
              You have answered <span className="font-bold text-gray-800">{answeredCount}</span> of <span className="font-bold text-gray-800">{test.questions.length}</span> questions. Once submitted, you cannot modify your answers.
            </p>

            {/* Warn if there are unanswered questions */}
            {answeredCount < test.questions.length && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 mb-6 text-xs text-red-700 flex items-start gap-2 font-semibold">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Warning: You have {test.questions.length - answeredCount} unanswered question(s).</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold text-xs hover:bg-gray-50 active:bg-gray-100 transition-all text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow transition-all text-center"
              >
                Confirm Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default TestPage;