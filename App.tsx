import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileCode, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { generatePythonApp } from './services/geminiService';
import { GeneratedProject, AppState } from './types';
import { CodeBlock } from './components/CodeBlock';
import { WelcomeHero } from './components/WelcomeHero';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Suggested prompts
  const suggestions = [
    "Aplikasi web Flask untuk To-Do List sederhana",
    "Script Python untuk scraping judul berita dari web",
    "REST API Kalkulator dengan history log",
    "Bot Discord sederhana untuk menyapa user"
  ];

  const handleGenerate = async (inputPrompt: string = prompt) => {
    if (!inputPrompt.trim()) return;

    setAppState(AppState.GENERATING);
    setErrorMsg(null);
    
    // Smooth scroll to top when generating
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await generatePythonApp(inputPrompt);
      setProject(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg("Maaf, terjadi kesalahan saat menghubungi AI. Pastikan API Key valid atau coba lagi nanti.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-slate-700 z-50 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
            <span className="font-mono font-bold text-white text-lg">Py</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Deploy Studio</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-400">
           {appState === AppState.SUCCESS && (
             <button 
               onClick={() => {
                 setAppState(AppState.IDLE);
                 setProject(null);
                 setPrompt('');
               }}
               className="hover:text-white transition-colors flex items-center gap-1"
             >
               <RefreshCw size={14} /> New Project
             </button>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-32 px-4 max-w-5xl mx-auto min-h-screen flex flex-col">
        
        {appState === AppState.IDLE && (
          <div className="flex-1 flex flex-col justify-center">
             <WelcomeHero />
             
             {/* Suggestions */}
             <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setPrompt(s);
                      handleGenerate(s);
                    }}
                    className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-700 text-sm text-slate-300 transition-all"
                  >
                    {s}
                  </button>
                ))}
             </div>
          </div>
        )}

        {appState === AppState.GENERATING && (
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
               <Loader2 size={64} className="text-indigo-400 animate-spin relative z-10" />
             </div>
             <h2 className="mt-8 text-2xl font-bold text-white">Sedang Merancang Arsitektur...</h2>
             <p className="mt-2 text-slate-400">AI sedang menulis kode Python, menyiapkan dependencies, dan struktur folder.</p>
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="flex-1 flex flex-col items-center justify-center text-center">
              <AlertCircle size={64} className="text-red-500 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong.</h2>
              <p className="text-slate-400 max-w-md">{errorMsg}</p>
              <button 
                onClick={() => setAppState(AppState.IDLE)}
                className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors"
              >
                Kembali ke Awal
              </button>
           </div>
        )}

        {appState === AppState.SUCCESS && project && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Project Header */}
             <div className="mb-8 border-b border-slate-700 pb-6">
               <h1 className="text-3xl font-bold text-white mb-2">{project.projectName}</h1>
               <p className="text-slate-400 text-lg">{project.description}</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Instructions & Structure */}
                <div className="lg:col-span-1 space-y-6">
                   <div className="bg-surface rounded-xl border border-slate-700 p-5">
                      <div className="flex items-center space-x-2 mb-4 text-indigo-400">
                        <Play size={20} />
                        <h3 className="font-semibold text-white">Cara Menjalankan</h3>
                      </div>
                      <div className="prose prose-invert prose-sm text-slate-300 whitespace-pre-line">
                        {project.setupInstructions}
                      </div>
                   </div>

                   <div className="bg-surface rounded-xl border border-slate-700 p-5">
                      <div className="flex items-center space-x-2 mb-4 text-slate-300">
                        <FileCode size={20} />
                        <h3 className="font-semibold text-white">Struktur File</h3>
                      </div>
                      <ul className="space-y-2">
                        {project.files.map((f, idx) => (
                          <li key={idx} className="flex items-center text-sm text-slate-400 bg-slate-800/50 p-2 rounded">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                            {f.filename}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>

                {/* Right Column: Code Viewer */}
                <div className="lg:col-span-2">
                   {project.files.map((file, index) => (
                      <CodeBlock 
                        key={index}
                        filename={file.filename}
                        content={file.content}
                        language={file.language}
                      />
                   ))}
                </div>
             </div>
          </div>
        )}

      </main>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-slate-700 p-4 lg:p-6 z-40">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jelaskan aplikasi yang ingin Anda buat... (Contoh: Buat aplikasi Flask untuk konversi mata uang)"
            className="w-full bg-surface border border-slate-600 rounded-xl pl-4 pr-14 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none shadow-xl placeholder:text-slate-500"
            rows={1}
            style={{ minHeight: '60px' }}
          />
          <button 
            onClick={() => handleGenerate()}
            disabled={appState === AppState.GENERATING || !prompt.trim()}
            className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            {appState === AppState.GENERATING ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-xs text-slate-500">Powered by Gemini AI • Generates production-ready Python code</p>
        </div>
      </div>
    </div>
  );
};

export default App;