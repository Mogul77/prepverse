

/**
 * Console Component
 * Displays execution status, standard output, compilation error, runtime error, execution time, and memory usage.
 *
 * @param {Object} props
 * @param {boolean} props.isRunning - Loading state of the code execution.
 * @param {Object|null} props.executionResult - The result returned from Judge0.
 */
function Console({ isRunning, executionResult }) {
  // Helper to determine status color scheme
  const getStatusBadgeStyle = (statusId) => {
    switch (statusId) {
      case 3: // Accepted
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
      case 4: // Wrong Answer
        return 'bg-amber-950/60 text-amber-400 border-amber-800/80';
      case 6: // Compilation Error
        return 'bg-rose-950/60 text-rose-400 border-rose-800/80';
      case 13: // Internal Error / Custom Execution Error
        return 'bg-red-950/60 text-red-400 border-red-800/80';
      default: // Any other error/status
        return 'bg-rose-950/60 text-rose-400 border-rose-800/80';
    }
  };

  // Check if result has standard error or runtime error status
  const hasRuntimeError = executionResult?.stderr || (executionResult?.status && ![3, 4, 6].includes(executionResult.status.id));

  return (
    <div className="bg-gray-950 border border-gray-850 rounded-2xl p-5 flex flex-col font-mono text-xs text-gray-400 shadow-inner w-full min-h-[180px] max-h-[350px]">
      {/* Header controls & stats */}
      <div className="flex items-center justify-between border-b border-gray-850 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isRunning ? 'bg-amber-400' : executionResult ? 'bg-emerald-400' : 'bg-gray-600'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isRunning ? 'bg-amber-500' : executionResult ? 'bg-emerald-500' : 'bg-gray-500'
            }`}></span>
          </span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Console Output
          </span>
        </div>

        {/* Stats: Time & Memory */}
        {executionResult && !isRunning && (
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Time: <strong className="text-gray-300 font-bold">{executionResult.time ? `${executionResult.time}s` : '0.00s'}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span>Memory: <strong className="text-gray-300 font-bold">{executionResult.memory ? `${executionResult.memory} KB` : '0 KB'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Main Console Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 select-text">
        {isRunning ? (
          <div className="flex flex-col gap-1.5 py-2">
            <div className="text-amber-400 font-semibold animate-pulse flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Compiling and executing code...
            </div>
            <div className="text-gray-600 italic">Please wait while Judge0 processes the execution.</div>
          </div>
        ) : executionResult ? (
          <div className="space-y-4">
            {/* Status Section */}
            {executionResult.status && (
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-gray-550 uppercase font-black tracking-wider">Status:</span>
                <span className={`font-black px-2.5 py-0.5 rounded text-[10px] uppercase border tracking-wider transition-all ${getStatusBadgeStyle(executionResult.status.id)}`}>
                  {executionResult.status.description}
                </span>
              </div>
            )}

            {/* Compilation Error Output */}
            {executionResult.compile_output && (
              <div className="space-y-1.5">
                <div className="text-red-400 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Compilation Error
                </div>
                <pre className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-xl p-4 whitespace-pre-wrap break-all overflow-x-auto leading-relaxed shadow-sm font-mono text-[11px]">
                  {executionResult.compile_output}
                </pre>
              </div>
            )}

            {/* Runtime Error / Standard Error Output */}
            {hasRuntimeError && (
              <div className="space-y-1.5">
                <div className="text-rose-400 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Runtime Error
                </div>
                <pre className="bg-rose-950/20 border border-rose-900/30 text-rose-300 rounded-xl p-4 whitespace-pre-wrap break-all overflow-x-auto leading-relaxed shadow-sm font-mono text-[11px]">
                  {executionResult.stderr || executionResult.message || 'Execution failed due to runtime error.'}
                </pre>
              </div>
            )}

            {/* Standard Output (STDOUT) */}
            {executionResult.stdout && (
              <div className="space-y-1.5">
                <div className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Standard Output (STDOUT)
                </div>
                <pre className="bg-emerald-950/10 border border-emerald-900/20 text-emerald-300 rounded-xl p-4 whitespace-pre-wrap break-all overflow-x-auto leading-relaxed shadow-sm font-mono text-[11px]">
                  {executionResult.stdout}
                </pre>
              </div>
            )}

            {/* No Output Case */}
            {!executionResult.stdout && !executionResult.stderr && !executionResult.compile_output && (
              <div className="text-gray-500 italic py-2">
                Program completed execution with exit code 0. Standard output was empty.
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 italic py-2">
            No execution logs available. Click "Run Code" to execute the current editor contents against the sample test case.
          </div>
        )}
      </div>
    </div>
  );
}

export default Console;
