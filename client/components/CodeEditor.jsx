import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ language, code, setCode }) {
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  return (
    <Editor
      height="500px"
      language={language}
      value={code}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 15,
        wordWrap: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false
      }}
    />
  );
}

export default CodeEditor;
