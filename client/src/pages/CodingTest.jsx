import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from '../../components/CodeEditor';
import { runCode } from '../services/judge0Service';
import Console from '../../components/Console';

const starterTemplates = {
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  python: `def main():
    # Write your code here
    pass

if __name__ == "__main__":
    main()`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  javascript: `function main() {
    // Write your code here
}

main();`
};

function CodingTest() {
  const { id, testId } = useParams();
  const actualTestId = testId || id;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State management for code execution
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState(starterTemplates.java);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
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
    fetchCodingQuestions();
  }, [actualTestId]);

  // Get the first coding question
  const question = questions[0];

  // Dynamically load the starter code when the language changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(starterTemplates[language] || '');
  }, [language]);

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setExecutionResult(null);
      const stdin = question?.sampleInput || '';
      const result = await runCode(code, language, stdin);
      setExecutionResult(result);
    } catch (err) {
      console.error('Execution error:', err);
      setExecutionResult({
        status: { id: 13, description: 'Execution Error' },
        stderr: err.response?.data?.message || err.message || 'An unexpected error occurred during execution.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionResult(null);

      // Fetch the latest question details to get hidden test cases
      const res = await axios.get(`http://localhost:5000/api/coding/test/${actualTestId}`);
      const latestQuestions = res.data;
      const latestQuestion = latestQuestions[0];

      if (!latestQuestion || !latestQuestion.hiddenTestCases || latestQuestion.hiddenTestCases.length === 0) {
        alert("No hidden test cases found for this question.");
        setIsSubmitting(false);
        return;
      }

     const testCases = [
  ...(latestQuestion.visibleTestCases || []),
  ...(latestQuestion.hiddenTestCases || [])
];
      let passedCount = 0;
      let totalTime = 0;
      let maxMemory = 0;
      const testCaseResults = [];

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        // Run code on Judge0
        const result = await runCode(code, language, tc.input || '');
        
        // Clean expected and actual outputs for comparison
        const expected = (tc.output || '').trim();
        const actual = (result.stdout || '').trim();
        console.log("Judge0 Result:", result);
        
        const statusId =
    result.status_id ||
    result.status?.id;

const passed =
    expected === actual &&
    statusId === 3;
        if (passed) passedCount++;

        totalTime += parseFloat(result.time || 0);
        maxMemory = Math.max(maxMemory, parseInt(result.memory || 0));

        testCaseResults.push({
          input: tc.input,
          expected,
          actual,
          status: result.status,
          passed,
          time: result.time,
          memory: result.memory,
          compile_output: result.compile_output,
          stderr: result.stderr
        });
        console.log("INPUT");
console.log(tc.input);

console.log("EXPECTED");
console.log(expected);

console.log("ACTUAL");
console.log(actual);

console.log(result);
      }

      const totalCount = testCases.length;
      const percentage = (passedCount / totalCount) * 100;

      setSubmissionResult({
        passedCount,
        totalCount,
        percentage,
        totalTime: totalTime.toFixed(3),
        maxMemory,
        results: testCaseResults
      });
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred during submission: ' + err.message);
    } finally {
      setIsSubmitting(false);
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
              <p className="text-sm text-gray-355 leading-relaxed whitespace-pre-wrap">
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
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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

          {/* Code Editor and Output Area */}
          <div className="flex-1 p-6 flex flex-col overflow-y-auto">
            {/* Reusable Code Editor component */}
            <div className="border border-gray-850 rounded-2xl overflow-hidden shadow-lg bg-gray-900">
              <CodeEditor language={language} code={code} setCode={setCode} />
            </div>

            {/* Console Output Section */}
            <div className="mt-4">
              <Console isRunning={isRunning} executionResult={executionResult} />
            </div>

            {/* Submission Results Panel */}
            {submissionResult && (
              <div className="mt-4 bg-gray-900 border border-blue-900/30 rounded-2xl p-5 flex flex-col font-mono text-xs text-gray-355 shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Submission Report
                  </span>
                  <button 
                    onClick={() => setSubmissionResult(null)}
                    className="text-gray-500 hover:text-gray-350 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-950/60 p-3.5 rounded-xl border border-gray-850 text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Passed Cases</div>
                    <div className="text-lg font-black text-emerald-400">
                      {submissionResult.passedCount} / {submissionResult.totalCount}
                    </div>
                    <div className="text-[9px] text-gray-605 mt-0.5">
                      ({submissionResult.percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="bg-gray-950/60 p-3.5 rounded-xl border border-gray-850 text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Total Time</div>
                    <div className="text-lg font-black text-sky-400">
                      {submissionResult.totalTime}s
                    </div>
                    <div className="text-[9px] text-gray-605 mt-0.5">Cumulative</div>
                  </div>
                  <div className="bg-gray-950/60 p-3.5 rounded-xl border border-gray-850 text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Max Memory</div>
                    <div className="text-lg font-black text-purple-400">
                      {submissionResult.maxMemory} KB
                    </div>
                    <div className="text-[9px] text-gray-605 mt-0.5">Peak Usage</div>
                  </div>
                </div>

                {/* Individual Test Cases status list */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {submissionResult.results.map((res, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                      res.passed 
                        ? 'bg-emerald-950/20 border-emerald-900/30' 
                        : 'bg-rose-950/20 border-rose-900/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${res.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="font-semibold text-gray-400">Test Case {idx + 1}:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500">
                          {res.time || '0.00'}s | {res.memory || 0} KB
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          res.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {res.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons bar */}
          <div className="bg-gray-900 border-t border-gray-850 px-6 py-4 flex items-center justify-end gap-3 shrink-0 animate-fadeIn">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`py-2.5 px-5 text-gray-200 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
                isRunning 
                  ? 'bg-gray-800 border-gray-800 opacity-60 cursor-not-allowed' 
                  : 'bg-gray-800 hover:bg-gray-750 border-gray-700'
              }`}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
            <button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className={`py-2.5 px-6 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow ${
                isRunning || isSubmitting
                  ? 'bg-blue-800 opacity-60 cursor-not-allowed text-gray-300'
                  : 'bg-blue-650 hover:bg-blue-700 text-white shadow-blue-900'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Code
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CodingTest;
