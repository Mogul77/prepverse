import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function AddCodingQuestions() {
  const { id } = useParams(); // This is the testId

  // Test details and questions state
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Coding Question Form States
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [timeLimit, setTimeLimit] = useState(1);
  const [memoryLimit, setMemoryLimit] = useState(256);

  // Starter Code
  const [starterCode, setStarterCode] = useState({
    java: '',
    python: '',
    cpp: '',
    javascript: ''
  });

  // Test Cases
  const [visibleTestCases, setVisibleTestCases] = useState([{ input: '', output: '' }]);
  const [hiddenTestCases, setHiddenTestCases] = useState([{ input: '', output: '' }]);

  // Editing States
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch data on load
  useEffect(() => {
    fetchTestDetails();
    fetchCodingQuestions();
  }, [id]);

  const fetchTestDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tests/${id}`);
      setTest(res.data);
    } catch (err) {
      console.error('Error fetching test details:', err);
    }
  };

  const fetchCodingQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/coding/test/${id}`);
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching coding questions:', err);
      setLoading(false);
    }
  };

  // Starter code state modifier
  const handleStarterCodeChange = (lang, value) => {
    setStarterCode((prev) => ({
      ...prev,
      [lang]: value
    }));
  };

  // Visible Test Cases state modifiers
  const handleVisibleTestCaseChange = (index, field, value) => {
    const updated = [...visibleTestCases];
    updated[index][field] = value;
    setVisibleTestCases(updated);
  };

  const addVisibleTestCase = () => {
    setVisibleTestCases([...visibleTestCases, { input: '', output: '' }]);
  };

  const removeVisibleTestCase = (index) => {
    if (visibleTestCases.length === 1) return;
    setVisibleTestCases(visibleTestCases.filter((_, i) => i !== index));
  };

  // Hidden Test Cases state modifiers
  const handleHiddenTestCaseChange = (index, field, value) => {
    const updated = [...hiddenTestCases];
    updated[index][field] = value;
    setHiddenTestCases(updated);
  };

  const addHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: '', output: '' }]);
  };

  const removeHiddenTestCase = (index) => {
    if (hiddenTestCases.length === 1) return;
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
  };

  // Form Reset
  const resetForm = () => {
    setTitle('');
    setDifficulty('Easy');
    setDescription('');
    setConstraints('');
    setInputFormat('');
    setOutputFormat('');
    setSampleInput('');
    setSampleOutput('');
    setExplanation('');
    setTimeLimit(1);
    setMemoryLimit(256);
    setStarterCode({
      java: '',
      python: '',
      cpp: '',
      javascript: ''
    });
    setVisibleTestCases([{ input: '', output: '' }]);
    setHiddenTestCases([{ input: '', output: '' }]);
    setEditing(false);
    setEditingId(null);
  };

  // Save/Update Coding Question Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      testId: id,
      title,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      explanation,
      starterCode,
      visibleTestCases,
      hiddenTestCases,
      timeLimit,
      memoryLimit
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/coding/${editingId}`, payload);
        alert('Coding Question updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/coding', payload);
        alert('Coding Question saved successfully!');
      }
      resetForm();
      fetchCodingQuestions();
    } catch (err) {
      console.error('Error saving coding question:', err);
      alert(err.response?.data?.message || 'Failed to save coding question. Please try again.');
    }
  };

  // Populate form for editing
  const handleEdit = (q) => {
    setEditing(true);
    setEditingId(q._id);
    setTitle(q.title || '');
    setDifficulty(q.difficulty || 'Easy');
    setDescription(q.description || '');
    setConstraints(q.constraints || '');
    setInputFormat(q.inputFormat || '');
    setOutputFormat(q.outputFormat || '');
    setSampleInput(q.sampleInput || '');
    setSampleOutput(q.sampleOutput || '');
    setExplanation(q.explanation || '');
    setTimeLimit(q.timeLimit !== undefined ? q.timeLimit : 1);
    setMemoryLimit(q.memoryLimit !== undefined ? q.memoryLimit : 256);
    setStarterCode({
      java: q.starterCode?.java || '',
      python: q.starterCode?.python || '',
      cpp: q.starterCode?.cpp || '',
      javascript: q.starterCode?.javascript || ''
    });
    setVisibleTestCases(q.visibleTestCases?.length ? q.visibleTestCases : [{ input: '', output: '' }]);
    setHiddenTestCases(q.hiddenTestCases?.length ? q.hiddenTestCases : [{ input: '', output: '' }]);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Coding Question Handler
  const handleDelete = async (questionId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this coding question?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/coding/${questionId}`);
      alert('Coding Question deleted successfully!');
      fetchCodingQuestions();
      if (editingId === questionId) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting coding question:', err);
      alert('Failed to delete coding question. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased pb-20">
      {/* Top Banner Navigation Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6 sm:px-8 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/manage-test" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Manage Tests
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">
              Coding Question Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">
              Current Test ID: <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{test?.title || id}</span>
            </p>
          </div>

          {test && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 text-xs font-bold self-start sm:self-center">
              Test Duration: {test.duration} min
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6 mb-10">
          <h2 className="text-lg font-black text-gray-850 flex items-center gap-2 border-b border-gray-100 pb-3.5">
            {editing ? (
              <>
                <span className="w-2.5 h-5 bg-amber-500 rounded-full"></span>
                Update Coding Question Details
              </>
            ) : (
              <>
                <span className="w-2.5 h-5 bg-blue-600 rounded-full"></span>
                Create Coding Question
              </>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Problem Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Find Longest Common Subsequence"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-gray-700 bg-white"
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                    Time (sec)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold text-gray-700 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                    Memory (MB)
                  </label>
                  <input
                    type="number"
                    min="16"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold text-gray-700 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section: Description & Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Problem Description
                </label>
                <textarea
                  placeholder="Explain the problem statement, context, and examples..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Constraints
                </label>
                <textarea
                  placeholder="e.g. 1 <= N <= 10^5&#10;All array elements are distinct integers."
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-mono"
                  rows={6}
                />
              </div>
            </div>

            {/* Section: Input/Output Formats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Input Format
                </label>
                <textarea
                  placeholder="Describe the format of standard input stream..."
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Output Format
                </label>
                <textarea
                  placeholder="Describe the format of expected standard output stream..."
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                  rows={3}
                />
              </div>
            </div>

            {/* Section: Sample I/O and Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Sample Input
                </label>
                <textarea
                  placeholder="Paste input example..."
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-mono"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Sample Output
                </label>
                <textarea
                  placeholder="Paste output example matching sample input..."
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-mono"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                  Sample Explanation
                </label>
                <textarea
                  placeholder="Provide step-by-step logic detailing how sample input reaches sample output..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                  rows={4}
                />
              </div>
            </div>

            {/* Section: Starter Code Section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <span>💻</span> Lang Starter Code Templates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Java */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                    Java
                  </label>
                  <textarea
                    placeholder="public class Solution {&#10;    public static void main(String[] args) {&#10;        // code here&#10;    }&#10;}"
                    value={starterCode.java}
                    onChange={(e) => handleStarterCodeChange('java', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-100 bg-gray-900 font-mono"
                    rows={6}
                  />
                </div>

                {/* Python */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                    Python
                  </label>
                  <textarea
                    placeholder="def solve():&#10;    # Write your code here&#10;    pass"
                    value={starterCode.python}
                    onChange={(e) => handleStarterCodeChange('python', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-100 bg-gray-900 font-mono"
                    rows={6}
                  />
                </div>

                {/* C++ */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                    C++
                  </label>
                  <textarea
                    placeholder="#include <iostream>&#10;using namespace std;&#10;&#10;int main() {&#10;    // code here&#10;    return 0;&#10;}"
                    value={starterCode.cpp}
                    onChange={(e) => handleStarterCodeChange('cpp', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-100 bg-gray-900 font-mono"
                    rows={6}
                  />
                </div>

                {/* JavaScript */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                    JavaScript
                  </label>
                  <textarea
                    placeholder="function solve() {&#10;    // Write code here&#10;}"
                    value={starterCode.javascript}
                    onChange={(e) => handleStarterCodeChange('javascript', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-100 bg-gray-900 font-mono"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Section: Visible Test Cases */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>🟢</span> Visible Test Cases (Shown to candidates)
                </h3>
                <button
                  type="button"
                  onClick={addVisibleTestCase}
                  className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100/50 hover:border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 outline-none select-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Test Case
                </button>
              </div>

              <div className="space-y-4">
                {visibleTestCases.map((tc, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start relative animate-fadeIn">
                    <div className="absolute top-4 right-4 md:static md:self-center">
                      <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md mr-2">
                        #{index + 1}
                      </span>
                      {visibleTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVisibleTestCase(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-lg shadow-sm hover:shadow transition-all outline-none"
                          title="Remove Test Case"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                          TestCase Input
                        </label>
                        <textarea
                          placeholder="Input stream for test..."
                          value={tc.input}
                          onChange={(e) => handleVisibleTestCaseChange(index, 'input', e.target.value)}
                          className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 font-mono bg-white"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                          Expected Output
                        </label>
                        <textarea
                          placeholder="Expected output matching input stream..."
                          value={tc.output}
                          onChange={(e) => handleVisibleTestCaseChange(index, 'output', e.target.value)}
                          className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 font-mono bg-white"
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Hidden Test Cases */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>🔒</span> Hidden Test Cases (Used for score valuation)
                </h3>
                <button
                  type="button"
                  onClick={addHiddenTestCase}
                  className="bg-purple-50 text-purple-650 border border-purple-100 hover:bg-purple-100/50 hover:border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 outline-none select-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Hidden Test Case
                </button>
              </div>

              <div className="space-y-4">
                {hiddenTestCases.map((tc, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start relative animate-fadeIn">
                    <div className="absolute top-4 right-4 md:static md:self-center">
                      <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md mr-2">
                        #{index + 1}
                      </span>
                      {hiddenTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHiddenTestCase(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-red-100 rounded-lg shadow-sm hover:shadow transition-all outline-none"
                          title="Remove Hidden Test Case"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                          TestCase Input
                        </label>
                        <textarea
                          placeholder="Input stream for test..."
                          value={tc.input}
                          onChange={(e) => handleHiddenTestCaseChange(index, 'input', e.target.value)}
                          className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 font-mono bg-white"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">
                          Expected Output
                        </label>
                        <textarea
                          placeholder="Expected output matching input stream..."
                          value={tc.output}
                          onChange={(e) => handleHiddenTestCaseChange(index, 'output', e.target.value)}
                          className="w-full border border-gray-250 rounded-xl p-2.5 text-xs focus:border-blue-500 outline-none transition-all text-gray-700 font-mono bg-white"
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Buttons Container */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="py-3 px-6 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all outline-none select-none active:scale-[0.98]"
              >
                {editing ? 'Cancel Editing' : 'Reset Form'}
              </button>
              <button
                type="submit"
                className={`py-3 px-8 text-white font-bold rounded-xl text-xs shadow hover:shadow-lg transition-all outline-none select-none active:scale-[0.98] ${
                  editing
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {editing ? 'Update Coding Question' : 'Save Coding Question'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Coding Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-5 bg-gray-900 rounded-full"></span>
              Repository: Coding Questions ({questions.length})
            </h2>
            <span className="text-xs font-semibold text-gray-400">
              Active Questions List
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-500 font-semibold animate-pulse">Loading coding questions repository...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                No Coding Questions Found
              </h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                No coding challenges have been registered for this test. Use the form above to create your first question.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, index) => (
                <div key={q._id} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-900 text-white px-2 py-0.5 rounded shadow-sm">
                        Q {index + 1}
                      </span>
                      
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : q.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {q.difficulty}
                      </span>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        Limits: {q.timeLimit || 1}s / {q.memoryLimit || 256}MB
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="py-1.5 px-3.5 border border-amber-300 hover:bg-amber-50 text-amber-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all outline-none active:scale-95"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="py-1.5 px-3.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all outline-none active:scale-95"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-gray-800 text-base md:text-lg">
                    {q.title}
                  </h3>

                  <p className="text-gray-650 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {q.description}
                  </p>

                  {(q.visibleTestCases?.length > 0 || q.hiddenTestCases?.length > 0) && (
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 flex flex-wrap gap-6 text-xs text-gray-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Visible Test Cases: <strong className="text-gray-700">{q.visibleTestCases?.length || 0}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Hidden Test Cases: <strong className="text-gray-700">{q.hiddenTestCases?.length || 0}</strong>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AddCodingQuestions;