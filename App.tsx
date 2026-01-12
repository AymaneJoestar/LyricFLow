
import React, { useState, useEffect } from 'react';
import { generateSongLyrics } from './services/geminiService';
import { generateSunoAudio } from './services/sunoService';
import { dbService } from './services/dbService';
import { GenerationState, GenerationInput, SongLyrics, User, SavedSong } from './types';
import { InputForm } from './components/InputForm';
import { InspirationForm } from './components/InspirationForm';
import { LandingPage } from './components/LandingPage';
import { LyricCard } from './components/LyricCard';
import { Button } from './components/Button';
import { AuthForm } from './components/AuthForm';
import { ProfilePage } from './components/ProfilePage';

type ViewState = 'landing' | 'form-standard' | 'form-inspiration' | 'result' | 'auth' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<GenerationState>({ isLoading: false, error: null, data: null });
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Connection Status
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    const health = await dbService.checkHealth();
    setIsServerOnline(health.online);
    setIsDbConnected(health.dbConnected);
    setIsChecking(false);
  };

  useEffect(() => {
    const u = dbService.getCurrentUser();
    if (u) {
      setUser(u);
    } else {
      setView('auth'); // Enforce login
    }
    checkStatus();
    const timer = setInterval(checkStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerate = async (input: GenerationInput) => {
    setState({ isLoading: true, error: null, data: null });
    setIsSaved(false);
    try {
      const data = await generateSongLyrics(input);
      setState({ isLoading: false, error: null, data });
      setView('result');
    } catch (err: any) {
      setState({ isLoading: false, error: "AI Error: check API key.", data: null });
    }
  };

  const handleSave = async () => {
    if (!user) { alert("Please log in to save songs."); setView('auth'); return; }
    if (!state.data) { alert("No song data to save."); return; }
    try {
      await dbService.saveSong(user.id, state.data);
      setIsSaved(true);
      checkStatus();
    } catch (e) {
      alert("Save failed. Server might be offline.");
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans flex flex-col p-6 sm:p-12">
      <nav className="max-w-5xl w-full mx-auto flex justify-between items-center mb-12 relative z-10">
        <div onClick={() => user ? setView('landing') : setView('auth')} className="flex items-center gap-3 cursor-pointer group">
          <div className="h-10 w-10 bg-surface border border-white/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          </div>
          <span className="text-2xl font-display font-bold uppercase tracking-tight">LyricFlow</span>
        </div>

        <div className="flex gap-4">
          {user ? (
            <>
              <button onClick={() => setView('profile')} className="text-sm font-bold text-gray-400 hover:text-white uppercase tracking-widest">Library</button>
              <button onClick={() => { dbService.logout(); setUser(null); setView('landing'); }} className="text-sm font-bold text-red-500/80 hover:text-red-500 uppercase tracking-widest">Logout</button>
            </>
          ) : (
            <button onClick={() => setView('auth')} className="text-sm font-bold text-primary uppercase tracking-widest hover:brightness-125">Sign In</button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto relative z-10 pb-24">
        {state.error && <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-200 mb-8">{state.error}</div>}

        {view === 'landing' && (
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 tracking-tighter">Your AI <span className="text-primary">Songwriter.</span></h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Generate studio-ready lyrics and reference tracks in seconds using the world's most creative AI agent.</p>
            <LandingPage onSelectStandard={() => setView('form-standard')} onSelectInspiration={() => setView('form-inspiration')} />
          </div>
        )}

        {view === 'auth' && <AuthForm onLoginSuccess={(u) => { setUser(u); setView('landing'); }} onBack={() => setView('landing')} />}
        {view === 'form-standard' && <InputForm onSubmit={handleGenerate} isLoading={state.isLoading} onBack={() => setView('landing')} />}
        {view === 'form-inspiration' && <InspirationForm onSubmit={handleGenerate} isLoading={state.isLoading} onBack={() => setView('landing')} />}
        {view === 'profile' && user && <ProfilePage user={user} onLoadSong={(s) => { setState({ isLoading: false, error: null, data: s }); setIsSaved(true); setView('result'); }} onBack={() => setView('landing')} />}

        {view === 'result' && state.data && (
          <div className="w-full flex flex-col items-center gap-6">
            <Button variant="ghost" onClick={() => setView('landing')}>← New Session</Button>
            <LyricCard
              data={state.data}
              onCopy={() => { }}
              onUpdate={(d) => setState({ ...state, data: d })}
              onGenerateAudio={async () => {
                setIsGeneratingAudio(true);
                try {
                  const url = await generateSunoAudio(state.data!);
                  const newData = { ...state.data!, audioUrl: url };
                  setState(prev => ({ ...prev, data: newData }));

                  // Automatic Persist
                  try {
                    if (isSaved && state.data && (state.data as any)._id) {
                      await dbService.updateSong((state.data as any)._id, { audioUrl: url });
                      console.log("Audio URL updated in DB");
                    } else if (user) {
                      const saved = await dbService.saveSong(user.id, newData);
                      setState(prev => ({ ...prev, data: { ...newData, ...saved } }));
                      setIsSaved(true);
                      console.log("Song and Audio saved to DB");
                    }
                  } catch (err) {
                    console.error("Failed to auto-save audio:", err);
                  }
                } catch (e: any) {
                  alert(e.message || "Failed to generate audio");
                } finally {
                  setIsGeneratingAudio(false);
                }
              }}
              isGeneratingAudio={isGeneratingAudio}
              onSave={handleSave}
              isSaved={isSaved}
            />
          </div>
        )}
      </main>

      {/* FIXED CONNECTION STATUS BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-white/5 p-4 z-50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isServerOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Server: {isServerOnline ? 'Online' : 'Not Detected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isDbConnected ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cloud DB: {isDbConnected ? 'Linked' : 'Waiting...'}</span>
            </div>
          </div>

          {!isServerOnline ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-tight">Run `node server.js` in terminal</span>
              <button onClick={checkStatus} disabled={isChecking} className="text-white hover:text-primary transition-colors">
                <svg className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          ) : !isDbConnected ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20 font-bold uppercase tracking-tight">Check MongoDB Network Access / Whitelist</span>
              <button onClick={checkStatus} className="text-primary text-[10px] font-bold uppercase">Retry</button>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest">Master Studio Linked & Ready</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
