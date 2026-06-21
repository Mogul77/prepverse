import React from 'react';

function LanguageSelector({ language, setLanguage }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-xs font-bold text-gray-400">
        Language:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold py-1.5 px-3 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-gray-750"
      >
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="javascript">JavaScript</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
