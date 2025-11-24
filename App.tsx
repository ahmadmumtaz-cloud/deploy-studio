import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileCode, Play, AlertCircle, RefreshCw, Mic, Search, BookOpen, Volume2, BrainCircuit, Zap } from 'lucide-react';
import { generatePythonApp, researchTechStack, generateSpeechInstructions } from './services/geminiService';
import { GeneratedProject, AppState, ResearchResult, GenerationMode } from './types';
import { CodeBlock } from './components/CodeBlock';
import { WelcomeHero } from './components/WelcomeHero';
import { LiveAssistant } from './components/LiveAssistant';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New State Features
  const [mode, setMode] = useState<GenerationMode>('standard');
  const [showResearch, setShowResearch] = useState(false);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
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
    setProject(null);
    
    // Smooth scroll to top when generating
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await generatePythonApp(inputPrompt, mode);
      setProject(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg("Maaf, terjadi kesalahan saat menghubungi AI. Pastikan API Key valid atau coba lagi nanti.");
    }
  };

  const handleResearch = async () => {
    if (!researchQuery.trim()) return;
    setIsResearching(true);
    try {
      const result = await researchTechStack(researchQuery);
      setResearchResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResearching(false);
    }
  };

  const handleTTS = async () => {
    if (!project?.setupInstructions || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const audioBuffer = await generateSpeechInstructions(project.setupInstructions);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await ctx.decodeAudioData(audioBuffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start(0);
    } catch (err) {
      console.error("TTS Error", err);
      setIsPlayingAudio(false);
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
      <LiveAssistant isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-slate-700 z-50 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
            <span className="font-mono font-bold text-white text-lg">Py</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Deploy Studio</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-slate-400">
          <button 
             onClick={() => setIsLiveOpen(true)}
             className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors font-medium text-xs md:text-sm"
          >
             <Mic size={14} /> <span className="hidden sm:inline">Voice Assistant</span>
          </button>
          
           {appState === AppState.SUCCESS && (
             <button 
               onClick={() => {
                 setAppState(AppState.IDLE);
                 setProject(null);
                 setPrompt('');
                 setResearchResult(null);
               }}
               className="hover:text-white transition-colors flex items-center gap-1"
             >
               <RefreshCw size={14} /> New Project
             </button>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-48 px-4 max-w-5xl mx-auto min-h-screen flex flex-col">
        
        {appState === AppState.IDLE && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
             <WelcomeHero />
             
             {/* Suggestions */}
             <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setPrompt(s);
                    }}
                    className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-700 text-sm text-slate-300 transition-all"
                  >
                    {s}
                  </button>
                ))}
             </div>
             
             {/* Research Toggle */}
             <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setShowResearch(!showResearch)}
                  className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                >
                  <Search size={16} /> Need help choosing libraries? Research first.
                </button>
             </div>

             {/* Research Panel */}
             {showResearch && (
               <div className="mt-4 max-w-2xl mx-auto w-full bg-slate-900 border border-slate-700 rounded-xl p-4 animate-in slide-in-from-top-2">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="e.g., Best library for PDF parsing in 2024"
                      className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                    />
                    <button 
                      onClick={handleResearch}
                      disabled={isResearching}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                    >
                      {isResearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                    </button>
                  </div>
                  {researchResult && (
                    <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-300">
                       <p className="mb-2">{researchResult.text}</p>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {researchResult.sources.map((src, idx) => (
                           <a 
                             key={idx} 
                             href={src.uri} 
                             target="_blank" 
                             rel="noreferrer"
                             className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/20 truncate max-w-[200px]"
                           >
                             {src.title}
                           </a>
                         ))}
                       </div>
                    </div>
                  )}
               </div>
             )}
          </div>
        )}

        {appState === AppState.GENERATING && (
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
               <Loader2 size={64} className="text-indigo-400 animate-spin relative z-10" />
             </div>
             <h2 className="mt-8 text-2xl font-bold text-white">
               {mode === 'thinking' ? "Thinking Deeply & Architecting..." : "Generating Solution..."}
             </h2>
             <p className="mt-2 text-slate-400">
               {mode === 'thinking' 
                 ? "Analyzing complex requirements and designing robust architecture." 
                 : "AI is writing code, preparing dependencies, and organizing files."}
             </p>
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
                Return Home
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-indigo-400">
                          <Play size={20} />
                          <h3 className="font-semibold text-white">Instructions</h3>
                        </div>
                        <button 
                          onClick={handleTTS}
                          disabled={isPlayingAudio}
                          className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                          title="Read Instructions"
                        >
                          {isPlayingAudio ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={18} />}
                        </button>
                      </div>
                      <div className="prose prose-invert prose-sm text-slate-300 whitespace-pre-line">
                        {project.setupInstructions}
                      </div>
                   </div>

                   <div className="bg-surface rounded-xl border border-slate-700 p-5">
                      <div className="flex items-center space-x-2 mb-4 text-slate-300">
                        <FileCode size={20} />
                        <h3 className="font-semibold text-white">File Structure</h3>
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
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-slate-700 p-4 lg:p-6 z-40 transition-transform duration-300">
        <div className="max-w-4xl mx-auto">
          
          {/* Mode Selector */}
          {appState === AppState.IDLE && (
            <div className="flex gap-4 mb-3 justify-center">
              <button 
                onClick={() => setMode('fast')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${mode === 'fast' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <Zap size={14} /> Fast Mode (Lite)
              </button>
              <button 
                onClick={() => setMode('standard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${mode === 'standard' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <BookOpen size={14} /> Standard
              </button>
              <button 
                onClick={() => setMode('thinking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${mode === 'thinking' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <BrainCircuit size={14} /> Thinking (Pro)
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the Python app you want to build... (e.g. A Flask app that converts currencies)"
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
        </div>
      </div>
    </div>
  );
};

export default App;
