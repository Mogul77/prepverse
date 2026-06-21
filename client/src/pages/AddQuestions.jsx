import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

/**
 * ExplanationDrawer Component
 * A collapsible section to view question explanations cleanly inside cards.
 */
function ExplanationDrawer({ explanation }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 text-left flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors select-none outline-none"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Explanation Guide
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-3 pt-1 text-xs text-gray-600 border-t border-gray-100/50 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </div>
      )}
    </div>
  );
}

/**
 * AddQuestions Component
 * Redesigned admin interface for constructing assessment modules with advanced stats,
 * manual question CRUD, and dynamic AI-powered document importing (PDF, DOCX, TXT).
 */
function AddQuestions() {
  const { id } = useParams();

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [test, setTest] = useState(null);

  // Manual Question Form States
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState("Easy");
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [type, setType] = useState("mcq"); // MCQ, coding, subjective, fillblank

  // Editing States
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ==========================================
  // AI IMPORT STATES
  // ==========================================
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Inline Generated Question Editing States
  const [editingGenIndex, setEditingGenIndex] = useState(null);
  const [genQuestion, setGenQuestion] = useState("");
  const [genOptions, setGenOptions] = useState(["", "", "", ""]);
  const [genCorrectAnswer, setGenCorrectAnswer] = useState("");
  const [genMarks, setGenMarks] = useState(1);
  const [genDifficulty, setGenDifficulty] = useState("Easy");
  const [genTopic, setGenTopic] = useState("");
  const [genExplanation, setGenExplanation] = useState("");
  const [genType, setGenType] = useState("mcq");

  // ==========================================
  // API ACTIONS & CRUD OPERATIONS
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
    } catch (error) {
      console.log(error);
    }
  };

  // EDIT ACTION PRE-POPULATION
  const handleEdit = (q) => {
    setEditing(true);
    setEditingId(q._id);

    setQuestion(q.question);
    setOptions(q.options || ["", "", "", ""]);
    setCorrectAnswer(q.correctAnswer);
    setMarks(q.marks || 1);
    setDifficulty(q.difficulty || "Easy");
    setTopic(q.topic || "");
    setExplanation(q.explanation || "");
    setType(q.type || "mcq");
  };

  // SUBMIT OR UPDATE ACTION (MANUAL FORM)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        type,
        question,
        options: type === "mcq" ? options : [],
        correctAnswer,
        marks,
        difficulty,
        topic,
        explanation,
      };

      if (editing) {
        await axios.put(
          `http://localhost:5000/api/tests/${id}/question/${editingId}`,
          payload
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/tests/${id}/question`,
          payload
        );
      }

      // RESET FORM LOGIC
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setMarks(1);
      setDifficulty("Easy");
      setTopic("");
      setExplanation("");
      setType("mcq");

      setEditing(false);
      setEditingId(null);

      fetchTest();
    } catch (error) {
      console.log(error);
    }
  };

  // DELETE QUESTION
  const handleDeleteQuestion = async (questionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/tests/${id}/question/${questionId}`
      );
      fetchTest();
    } catch (error) {
      console.log(error);
    }
  };

  // OPTION FIELD CHANGE HANDLER WITH SYNCED ANSWER CHECK
  const handleOptionChange = (value, index) => {
    const updated = [...options];
    const oldValue = updated[index];
    updated[index] = value;
    setOptions(updated);

    // Dynamic Correct Answer syncing
    if (correctAnswer === oldValue && type === "mcq") {
      setCorrectAnswer(value);
    }
  };

  // CANCEL OPERATION (MANUAL FORM)
  const handleCancel = () => {
    setEditing(false);
    setEditingId(null);

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setMarks(1);
    setDifficulty("Easy");
    setTopic("");
    setExplanation("");
    setType("mcq");
  };

  // ==========================================
  // AI UPLOAD & PARSING ACTIONS
  // ==========================================
  const handleAIUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingAI(true);
    setUploadError("");
    setUploadSuccess(false);
    setGeneratedQuestions([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && res.data.questions) {
        if (res.data.questions.length === 0) {
          setUploadError("No questions generated.");
        } else {
          setGeneratedQuestions(res.data.questions);
          setUploadSuccess(true);
        }
      } else {
        setUploadError("AI parsing response was empty or did not contain questions.");
      }
    } catch (err) {
      console.log(err);
      setUploadError(err.response?.data?.message || "File upload and question generation failed.");
    } finally {
      setLoadingAI(false);
      e.target.value = null; // reset target file
    }
  };

  // ==========================================
  // INLINE GENERATED PREVIEW OPERATIONS
  // ==========================================
  const startEditGenerated = (index) => {
    const q = generatedQuestions[index];
    setEditingGenIndex(index);

    setGenQuestion(q.question);
    setGenOptions(q.options || ["", "", "", ""]);
    setGenCorrectAnswer(q.correctAnswer);
    setGenMarks(q.marks || 1);
    setGenDifficulty(q.difficulty || "Easy");
    setGenTopic(q.topic || "");
    setGenExplanation(q.explanation || "");
    setGenType(q.type || "mcq");
  };

  const saveEditedGenerated = (index) => {
    const updated = [...generatedQuestions];
    updated[index] = {
      type: genType,
      question: genQuestion,
      options: genType === "mcq" ? genOptions : [],
      correctAnswer: genCorrectAnswer,
      marks: genMarks,
      difficulty: genDifficulty,
      topic: genTopic,
      explanation: genExplanation,
    };
    setGeneratedQuestions(updated);
    setEditingGenIndex(null);
  };

  const cancelEditGenerated = () => {
    setEditingGenIndex(null);
  };

  const deleteGenerated = (index) => {
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    if (editingGenIndex === index) {
      setEditingGenIndex(null);
    } else if (editingGenIndex > index) {
      setEditingGenIndex(editingGenIndex - 1);
    }
  };

  const handleGenOptionChange = (value, index) => {
    const updated = [...genOptions];
    const oldValue = updated[index];
    updated[index] = value;
    setGenOptions(updated);

    if (genCorrectAnswer === oldValue && genType === "mcq") {
      setGenCorrectAnswer(value);
    }
  };

  // BULK SAVE ALL GENERATED QUESTIONS
  const handleSaveAllGenerated = async () => {
    if (generatedQuestions.length === 0) return;

    let successCount = 0;
    let failedCount = 0;

    for (const q of generatedQuestions) {
      try {
        await axios.post(
          `http://localhost:5000/api/tests/${id}/question`,
          {
            type: q.type || "mcq",
            question: q.question,
            options: q.type === "mcq" ? q.options : [],
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
            difficulty: q.difficulty || "Easy",
            topic: q.topic || "",
            explanation: q.explanation || "",
          }
        );
        successCount++;
      } catch (err) {
        console.error("Save question error:", err);
        failedCount++;
      }
    }

    if (failedCount > 0) {
      alert(`Save failed for ${failedCount} question(s). ${successCount} questions imported successfully.`);
    } else {
      alert("Questions Imported Successfully");
    }

    // Refresh metrics & clearing previews
    fetchTest();
    setGeneratedQuestions([]);
    setUploadSuccess(false);
  };

  // ==========================================
  // RENDER INTERMEDIATE LOADING STATE
  // ==========================================
  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-semibold animate-pulse">
          Loading assessment information...
        </p>
      </div>
    );
  }

  // ==========================================
  // DYNAMIC STATISTICS CALCULATIONS
  // ==========================================
  const totalQuestions = test.questions.length;
  const easyCount = test.questions.filter((q) => q.difficulty === "Easy").length;
  const mediumCount = test.questions.filter((q) => q.difficulty === "Medium").length;
  const hardCount = test.questions.filter((q) => q.difficulty === "Hard").length;
  const totalMarks = test.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased pb-16">
      
      {/* Top Banner Navigation Row */}
      <header className="bg-white border-b border-gray-200 py-5 px-6 sm:px-8 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
              Assessment Administrator Panel
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-none flex items-center gap-2">
              Configure Questions
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Test: <span className="text-gray-800 font-bold">{test.title}</span>
            </p>
          </div>
          
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 text-xs font-bold shrink-0 self-start sm:self-center">
            Module Duration: {test.duration} min
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==========================================
            METRICS DASHBOARD WIDGETS
            ========================================== */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          
          {/* Total Questions */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow flex items-center gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider leading-none mb-1">
                Total Questions
              </span>
              <span className="text-xl font-extrabold text-gray-800 leading-none">
                {totalQuestions}
              </span>
            </div>
          </div>

          {/* Easy Count */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider leading-none mb-1">
                Easy Level
              </span>
              <span className="text-xl font-extrabold text-emerald-600 leading-none">
                {easyCount}
              </span>
            </div>
          </div>

          {/* Medium Count */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider leading-none mb-1">
                Medium Level
              </span>
              <span className="text-xl font-extrabold text-amber-600 leading-none">
                {mediumCount}
              </span>
            </div>
          </div>

          {/* Hard Count */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow flex items-center gap-3.5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider leading-none mb-1">
                Hard Level
              </span>
              <span className="text-xl font-extrabold text-rose-600 leading-none">
                {hardCount}
              </span>
            </div>
          </div>

          {/* Total Marks */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow flex items-center gap-3.5 col-span-2 sm:col-span-1">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider leading-none mb-1">
                Total Marks
              </span>
              <span className="text-xl font-extrabold text-indigo-600 leading-none">
                {totalMarks}
              </span>
            </div>
          </div>

        </section>

        {/* ==========================================
            SPLIT GRID COLUMNS
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR PANEL: FORM SUBMISSIONS (lg:col-span-5) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* AI QUESTION IMPORT CARD */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span>🤖</span>
                AI Question Generator
              </h2>
              
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Upload a PDF, DOCX or TXT file and let AI generate questions automatically.
              </p>

              {/* Upload Input Area */}
              <div>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-all duration-200 ${
                  loadingAI
                    ? "opacity-50 cursor-not-allowed bg-gray-50/50"
                    : "hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer"
                }`}>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <span className="text-xs font-bold text-gray-700">
                    {loadingAI ? "Reading Document..." : "Upload File"}
                  </span>
                  
                  <span className="text-[10px] text-gray-400 mt-1 font-medium">
                    Accepted: .pdf, .docx, .txt
                  </span>
                  
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt" 
                    onChange={handleAIUpload} 
                    className="hidden" 
                    disabled={loadingAI}
                  />
                </label>
              </div>

              {/* Success Upload Feedback Alert */}
              {uploadSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-bold block">Generated successfully!</span>
                    Verify the details in the AI Preview section on the right.
                  </div>
                </div>
              )}

              {/* Failure Error Feedback Card */}
              {uploadError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-bold block">Upload Error</span>
                    {uploadError}
                  </div>
                </div>
              )}

              {/* Loading State Overlay Screen */}
              {loadingAI && (
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-center space-y-2 animate-pulse">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="text-[11px] font-bold text-blue-900 leading-none">
                    Generating AI Questions...
                  </div>
                  <div className="text-[9px] text-blue-700/80 leading-none font-semibold">
                    Reading your document... Please wait...
                  </div>
                </div>
              )}

            </div>

            {/* MANUAL CREATE FORM CARD */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6 lg:sticky lg:top-[112px]">
              
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                {editing ? (
                  <>
                    <span className="w-2 h-5 bg-amber-500 rounded-full"></span>
                    Edit Question Details
                  </>
                ) : (
                  <>
                    <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                    Create New Question (Manual)
                  </>
                )}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION 1: QUESTION TYPE & PROMPT */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>01</span> Question Metadata & Text
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
                      Question Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        setCorrectAnswer(""); // clear answer to prevent type collision
                      }}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-white"
                      required
                    >
                      <option value="mcq">Multiple Choice Question (MCQ)</option>
                      <option value="coding">Coding Challenge</option>
                      <option value="subjective">Subjective / Theory</option>
                      <option value="fillblank">Fill in the Blanks</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
                      Question Statement
                    </label>
                    <textarea
                      placeholder="Enter the primary problem prompt statement..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* SECTION 2: OPTIONS CONFIGURATION (MCQ ONLY) */}
                {type === "mcq" && (
                  <div className="space-y-3.5 pt-2 animate-fadeIn">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>02</span> MCQ Option Selections
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {options.map((opt, index) => (
                        <div key={index}>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">
                            Option {String.fromCharCode(65 + index)}
                          </label>
                          <input
                            type="text"
                            placeholder={`Text for Option ${String.fromCharCode(65 + index)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(e.target.value, index)}
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                            required={type === "mcq"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: KEY ANSWER SOLUTION */}
                <div className="space-y-3.5 pt-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>03</span> Expected Correct Answer
                  </h3>

                  <div>
                    {type === "mcq" ? (
                      <select
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-medium bg-white"
                        required
                      >
                        <option value="">Choose option text</option>
                        {options.map((opt, idx) => (
                          <option key={idx} value={opt} disabled={!opt}>
                            {opt 
                              ? `Option ${String.fromCharCode(65 + idx)}: ${opt}` 
                              : `Option ${String.fromCharCode(65 + idx)} (is empty)`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        placeholder={
                          type === "coding" 
                            ? "Paste sample correct solution snippet or reference output..." 
                            : "Enter correct answer criteria..."
                        }
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-mono"
                        rows={2}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* SECTION 4: ASSESSMENT PARAMETERS */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>04</span> Metadata & Parameters
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
                        Marks Allocated
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={marks}
                        onChange={(e) => setMarks(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-medium bg-white"
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
                      Topic Keyword
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Graph Theory, Dynamic Programming"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1.5">
                      Explanatory Steps
                    </label>
                    <textarea
                      placeholder="Provide reasoning details for test takers..."
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                      rows={2.5}
                    />
                  </div>
                </div>

                {/* SECTION 5: CONTROLS & SUBMIT BUTTONS */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all text-center select-none active:scale-[0.98] outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 text-white font-bold rounded-xl text-xs shadow hover:shadow-lg transition-all text-center select-none active:scale-[0.98] outline-none ${
                      editing 
                        ? "bg-amber-600 hover:bg-amber-700 active:bg-amber-800" 
                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    }`}
                  >
                    {editing ? "Update Question" : "Save Question"}
                  </button>
                </div>

              </form>

            </div>
          </section>

          {/* RIGHT PANEL: AI GENERATED PREVIEWS & EXISTING QUESTIONS LIST (lg:col-span-7) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* AI GENERATED QUESTIONS PREVIEW */}
            {generatedQuestions.length > 0 && (
              <div className="bg-blue-50/30 border border-blue-200 rounded-3xl p-6 space-y-6">
                
                <div className="flex items-center justify-between border-b border-blue-200/50 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                      AI Generated Questions Preview
                    </h2>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      Review, edit, and approve these questions before final test imports.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-blue-100 text-blue-850 px-3 py-1 rounded-full border border-blue-200">
                    {generatedQuestions.length} Items
                  </span>
                </div>

                {/* Previews feed mapping */}
                <div className="space-y-4">
                  {generatedQuestions.map((q, index) => {
                    const isEditingGen = editingGenIndex === index;
                    
                    return (
                      <div key={index}>
                        {isEditingGen ? (
                          /* INLINE GENERATED CARD EDITOR */
                          <div className="bg-white rounded-2xl border border-blue-400 p-5 sm:p-6 shadow-md space-y-4 animate-scaleUp">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="text-xs font-bold text-blue-600">
                                Edit AI Question #{index + 1}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                Local Sandbox
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Type</label>
                                <select
                                  value={genType}
                                  onChange={(e) => {
                                    setGenType(e.target.value);
                                    setGenCorrectAnswer("");
                                  }}
                                  className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 bg-white"
                                >
                                  <option value="mcq">MCQ</option>
                                  <option value="coding">Coding</option>
                                  <option value="subjective">Subjective</option>
                                  <option value="fillblank">Fill Blanks</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Topic</label>
                                <input
                                  type="text"
                                  value={genTopic}
                                  onChange={(e) => setGenTopic(e.target.value)}
                                  className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Question Statement</label>
                              <textarea
                                value={genQuestion}
                                onChange={(e) => setGenQuestion(e.target.value)}
                                className="w-full border border-gray-255 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700"
                                rows={2.5}
                              />
                            </div>

                            {/* Options fields for local editing */}
                            {genType === "mcq" && (
                              <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-150">
                                {genOptions.map((opt, i) => (
                                  <div key={i}>
                                    <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Option {String.fromCharCode(65 + i)}</label>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => handleGenOptionChange(e.target.value, i)}
                                      className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:border-blue-500 outline-none transition-all text-gray-705 bg-white"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Expected Solution</label>
                              {genType === "mcq" ? (
                                <select
                                  value={genCorrectAnswer}
                                  onChange={(e) => setGenCorrectAnswer(e.target.value)}
                                  className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 bg-white"
                                >
                                  <option value="">Choose option value</option>
                                  {genOptions.map((opt, idx) => (
                                    <option key={idx} value={opt} disabled={!opt}>
                                      {opt ? `Option ${String.fromCharCode(65 + idx)}: ${opt}` : `Option ${String.fromCharCode(65 + idx)} (is empty)`}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <textarea
                                  value={genCorrectAnswer}
                                  onChange={(e) => setGenCorrectAnswer(e.target.value)}
                                  className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 font-mono"
                                  rows={2}
                                />
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Marks</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={genMarks}
                                  onChange={(e) => setGenMarks(Number(e.target.value))}
                                  className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Difficulty</label>
                                <select
                                  value={genDifficulty}
                                  onChange={(e) => setGenDifficulty(e.target.value)}
                                  className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 bg-white"
                                >
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Hard">Hard</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Explanatory logic</label>
                              <textarea
                                value={genExplanation}
                                onChange={(e) => setGenExplanation(e.target.value)}
                                className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700"
                                rows={2}
                              />
                            </div>

                            {/* Editing Controls */}
                            <div className="flex gap-3 pt-3 border-t border-gray-100">
                              <button
                                type="button"
                                onClick={cancelEditGenerated}
                                className="flex-1 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all outline-none"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEditedGenerated(index)}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all outline-none"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* AI QUESTION CARD DISPLAY */
                          <div className="bg-white rounded-2xl border border-blue-200 p-5 sm:p-6 shadow-sm hover:shadow transition-all space-y-4">
                            
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm">
                                AI PREVIEW {index + 1}
                              </span>

                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                q.type === "mcq" 
                                  ? "bg-blue-50 text-blue-700 border-blue-100" 
                                  : q.type === "coding"
                                    ? "bg-purple-50 text-purple-700 border-purple-100"
                                    : q.type === "fillblank"
                                      ? "bg-cyan-50 text-cyan-700 border-cyan-100"
                                      : "bg-gray-50 text-gray-700 border-gray-100"
                              }`}>
                                {q.type === "mcq" ? "MCQ" : q.type === "coding" ? "Coding" : q.type === "fillblank" ? "Fill Blanks" : "Subjective"}
                              </span>

                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                q.difficulty === "Easy" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                  : q.difficulty === "Medium"
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                              }`}>
                                {q.difficulty || "Easy"}
                              </span>

                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-100">
                                {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                              </span>

                              {q.topic && (
                                <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  #{q.topic}
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-relaxed">
                              {q.question}
                            </h3>

                            {q.type === "mcq" && q.options && q.options.length > 0 && (
                              <div className="space-y-2 pl-1.5">
                                {q.options.map((opt, idx) => {
                                  const isCorrectOption = q.correctAnswer === opt;
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                                        isCorrectOption
                                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950 font-semibold"
                                          : "bg-gray-50 border-gray-100 text-gray-600"
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full border text-[9px] flex items-center justify-center shrink-0 font-bold ${
                                        isCorrectOption
                                          ? "border-emerald-600 bg-emerald-600 text-white"
                                          : "border-gray-300 text-gray-400 bg-white"
                                      }`}>
                                        {String.fromCharCode(65 + idx)}
                                      </div>
                                      <span>{opt}</span>
                                      {isCorrectOption && (
                                        <span className="ml-auto text-[9px] font-extrabold uppercase text-emerald-600 tracking-wider">
                                          Correct Option
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {q.type !== "mcq" && (
                              <div className="bg-emerald-50/[0.35] border border-emerald-100/60 rounded-xl p-3 text-xs text-emerald-900">
                                <span className="font-bold block uppercase tracking-wider text-[9px] text-emerald-700 mb-1 leading-none">
                                  Expected Response:
                                </span>
                                <code className="block whitespace-pre-wrap font-mono bg-white p-2.5 rounded border border-emerald-100/60 text-emerald-800 leading-relaxed max-h-[160px] overflow-y-auto">
                                  {q.correctAnswer}
                                </code>
                              </div>
                            )}

                            {q.explanation && (
                              <ExplanationDrawer explanation={q.explanation} />
                            )}

                            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => startEditGenerated(index)}
                                className="flex-1 py-2 px-3 border border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98] outline-none"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Locally
                              </button>
                              <button
                                onClick={() => deleteGenerated(index)}
                                className="flex-1 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98] outline-none"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bulk Save CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleSaveAllGenerated}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 select-none active:scale-[0.98] outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save All Questions ({generatedQuestions.length})
                  </button>
                </div>
              </div>
            )}

            {/* ASSESSMENT REPOSITORY HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-2">
              <h2 className="text-base font-bold text-gray-800 font-bold">
                Question Repository List
              </h2>
              <span className="text-xs font-semibold text-gray-400 font-bold">
                {totalQuestions} Active Items
              </span>
            </div>

            {/* EMPTY STATE ILLUSTRATION */}
            {totalQuestions === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 animate-pulse">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-855 mb-1.5">
                  No Questions Added Yet
                </h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
                  Start drafting question options and correct key values on the left panel to register assessment entries.
                </p>
              </div>
            ) : (
              /* REPOSITORY QUESTION CARDS FEED */
              <div className="space-y-4">
                {test.questions.map((q, index) => (
                  <div 
                    key={q._id} 
                    className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow transition-all space-y-4"
                  >
                    
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-gray-900 text-white px-2 py-0.5 rounded shadow-sm">
                        Q {index + 1}
                      </span>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        q.type === "mcq" 
                          ? "bg-blue-50 text-blue-700 border-blue-100" 
                          : q.type === "coding"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : q.type === "fillblank"
                              ? "bg-cyan-50 text-cyan-700 border-cyan-100"
                              : "bg-gray-50 text-gray-700 border-gray-100"
                      }`}>
                        {q.type === "mcq" ? "MCQ" : q.type === "coding" ? "Coding" : q.type === "fillblank" ? "Fill Blanks" : "Subjective"}
                      </span>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        q.difficulty === "Easy" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : q.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {q.difficulty || "Easy"}
                      </span>

                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-100">
                        {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                      </span>

                      {q.topic && (
                        <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          #{q.topic}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-relaxed">
                      {q.question}
                    </h3>

                    {q.type === "mcq" && q.options && q.options.length > 0 && (
                      <div className="space-y-2 pl-1.5">
                        {q.options.map((opt, i) => {
                          const isCorrectOption = q.correctAnswer === opt;
                          return (
                            <div 
                              key={i} 
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                                isCorrectOption
                                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-950 font-semibold"
                                  : "bg-gray-50 border-gray-100 text-gray-600"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border text-[9px] flex items-center justify-center shrink-0 font-bold ${
                                isCorrectOption
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-gray-300 text-gray-400 bg-white"
                              }`}>
                                {String.fromCharCode(65 + i)}
                              </div>
                              <span>{opt}</span>
                              {isCorrectOption && (
                                <span className="ml-auto text-[9px] font-extrabold uppercase text-emerald-600 tracking-wider">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type !== "mcq" && (
                      <div className="bg-emerald-50/[0.35] border border-emerald-100/60 rounded-xl p-3 text-xs text-emerald-900">
                        <span className="font-bold block uppercase tracking-wider text-[9px] text-emerald-700 mb-1 leading-none">
                          Correct Solution Criteria:
                        </span>
                        <code className="block whitespace-pre-wrap font-mono bg-white p-2.5 rounded border border-emerald-100/60 text-emerald-800 leading-relaxed max-h-[160px] overflow-y-auto">
                          {q.correctAnswer}
                        </code>
                      </div>
                    )}

                    {q.explanation && (
                      <ExplanationDrawer explanation={q.explanation} />
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(q)}
                        className="flex-1 py-2 px-3 border border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98] outline-none"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="flex-1 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98] outline-none"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AddQuestions;