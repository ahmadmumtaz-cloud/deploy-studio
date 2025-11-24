import React from 'react';
import { Terminal, Sparkles, Box, Code2 } from 'lucide-react';

export const WelcomeHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-indigo-500/30">
        <Terminal size={40} className="text-indigo-400" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
        Bangun Aplikasi Python <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          Dalam Sekejap dengan AI
        </span>
      </h1>
      <p className="text-slate-400 max-w-xl text-lg mb-8 leading-relaxed">
        Deskripsikan aplikasi yang ingin Anda buat dalam bahasa Indonesia. 
        AI akan menulis kode, menyiapkan dependencies, dan struktur project untuk Anda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl text-left">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Code2 size={20} /></div>
            <h3 className="font-semibold text-slate-200">No Coding Required</h3>
          </div>
          <p className="text-sm text-slate-500">Cukup jelaskan ide Anda, biarkan AI menangani sintaks Python yang rumit.</p>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Box size={20} /></div>
            <h3 className="font-semibold text-slate-200">Modular & Clean</h3>
          </div>
          <p className="text-sm text-slate-500">Output kode standar industri dengan struktur file yang rapi dan modular.</p>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Sparkles size={20} /></div>
            <h3 className="font-semibold text-slate-200">Ready to Deploy</h3>
          </div>
          <p className="text-sm text-slate-500">Otomatis menyertakan requirements.txt agar siap dijalankan di server mana pun.</p>
        </div>
      </div>
    </div>
  );
};