import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CodingTest() {
  const { id, testId } = useParams();
  const actualTestId = testId || id;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  useEffect(() => {
    fetchCodingQuestions();
  }, [actualTestId]);

  const fetchCodingQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/coding/test/${actualTestId}`);
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching coding questions:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-semibold animate-pulse">Loading coding assessment...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mb-6 text-gray-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-200 mb-2">No Coding Questions Available</h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          This test does not contain any coding challenges yet. Please contact the administrator.
        </p>
        <Link to="/tests" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-900">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Display only the first coding question as per requirements
  const question = questions[0];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-gray-300">
      {/* Header Panel */}
      <header className="bg-gray-900 border-b border-gray-850 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/tests" className="text-gray-400 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Exit Assessment
          </Link>
          <span className="text-gray-700 font-mono">|</span>
          <div>
            <h1 className="text-base font-black text-gray-100 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500 rounded-sm"></span>
              Coding Assessment
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
            Q 1 of {questions.length}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-900">
            Active Session
          </span>
        </div>
      </header>

      {/* Main Workspace split panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: Problem description (45% width) */}
        <div className="w-full md:w-[45%] border-r border-gray-850 bg-gray-900 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Title & Metadata Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  question.difficulty === 'Easy'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                    : question.difficulty === 'Medium'
                      ? 'bg-amber-950 text-amber-400 border-amber-900'
                      : 'bg-rose-950 text-rose-400 border-rose-900'
                }`}>
                  {question.difficulty || 'Easy'}
                </span>
                
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-900 uppercase tracking-wider">
                  Time Limit: {question.timeLimit || 1}s
                </span>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-900 uppercase tracking-wider">
                  Memory Limit: {question.memoryLimit || 256}MB
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white">
                {question.title}
              </h2>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Problem Description</h3>
              <p className="text-sm text-gray-350 leading-relaxed whitespace-pre-wrap">
                {question.description}
              </p>
            </div>

            {/* Constraints */}
            {question.constraints && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Constraints</h3>
                <pre className="bg-gray-950 border border-gray-850 rounded-xl p-3.5 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {question.constraints}
                </pre>
              </div>
            )}

            {/* Input & Output Format */}
            {(question.inputFormat || question.outputFormat) && (
              <div className="grid grid-cols-1 gap-5 pt-2">
                {question.inputFormat && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Input Format</h3>
                    <p className="text-sm text-gray-355 leading-relaxed">
                      {question.inputFormat}
                    </p>
                  </div>
                )}
                
                {question.outputFormat && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Output Format</h3>
                    <p className="text-sm text-gray-355 leading-relaxed">
                      {question.outputFormat}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sample Input & Output */}
            {(question.sampleInput || question.sampleOutput) && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Sample Test Case</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {question.sampleInput && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Sample Input</span>
                      <pre className="bg-gray-950 border border-gray-850 rounded-xl p-3.5 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap leading-normal">
                        {question.sampleInput}
                      </pre>
                    </div>
                  )}

                  {question.sampleOutput && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Sample Output</span>
                      <pre className="bg-gray-950 border border-gray-850 rounded-xl p-3.5 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap leading-normal">
                        {question.sampleOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Explanation */}
            {question.explanation && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Explanation</h3>
                <p className="text-sm text-gray-350 leading-relaxed whitespace-pre-wrap">
                  {question.explanation}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: Code Editor Area (55% width) */}
        <div className="w-full md:w-[55%] flex flex-col bg-gray-950 overflow-hidden">
          
          {/* Editor Header controls */}
          <div className="bg-gray-900/60 border-b border-gray-850 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold py-1.5 px-3 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              IDE Sandbox Ready
            </div>
          </div>

          {/* Code Editor Container Box */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="flex-1 bg-gray-900 border border-gray-850 rounded-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
              
              {/* Ide background pattern decoration */}
              <div className="absolute inset-0 opacity-5 select-none font-mono text-[10px] text-left p-4 leading-relaxed pointer-events-none">
                {`// Pre-loaded starter code structure\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Code editor loading state\n    for (int i = 0; i < N; i++) {\n        cout << "System OK" << endl;\n    }\n    return 0;\n}`}
              </div>

              <div className="max-w-md space-y-4 z-10">
                <div className="w-16 h-16 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-center mx-auto text-blue-500 shadow-md">
                  <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                
                <h3 className="text-base font-black text-gray-200 uppercase tracking-wider">
                  IDE Coding Sandbox
                </h3>
                
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Code editor will be integrated in the next phase.
                </p>

                <div className="inline-block bg-gray-950 border border-gray-800 rounded-lg px-3.5 py-1.5 text-[10px] font-mono text-gray-500">
                  Ready for Monaco Editor Integration
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons bar */}
          <div className="bg-gray-900 border-t border-gray-850 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
            <button
              disabled
              className="py-2.5 px-5 border border-gray-800 bg-gray-900/50 text-gray-650 rounded-xl text-xs font-bold transition-all opacity-55 cursor-not-allowed select-none flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Code
            </button>
            <button
              disabled
              className="py-2.5 px-6 bg-blue-600/30 text-blue-400 border border-blue-900 rounded-xl text-xs font-bold transition-all opacity-55 cursor-not-allowed select-none flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit Code
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CodingTest;
