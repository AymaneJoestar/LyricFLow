import React from 'react';

interface LandingPageProps {
  onSelectStandard: () => void;
  onSelectInspiration: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectStandard, onSelectInspiration }) => {
  return (
    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
      {/* Option 1: Standard Creation */}
      <button 
        onClick={onSelectStandard}
        className="group relative h-80 rounded-xl overflow-hidden glass-panel border border-white/5 hover:border-primary/40 transition-all duration-300 text-left p-8 flex flex-col hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative z-10 flex-1">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-primary transition-colors">Custom Creation</h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            Build a song from scratch by choosing your topic, specific mood, and musical genre.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center text-sm font-bold text-primary uppercase tracking-wider group-hover:translate-x-2 transition-transform">
          Start Creating <span className="ml-2">→</span>
        </div>
      </button>

      {/* Option 2: Vibe Matcher */}
      <button 
        onClick={onSelectInspiration}
        className="group relative h-80 rounded-xl overflow-hidden glass-panel border border-white/5 hover:border-secondary/40 transition-all duration-300 text-left p-8 flex flex-col hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative z-10 flex-1">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 text-secondary group-hover:bg-secondary group-hover:text-black transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-secondary transition-colors">Vibe Matcher</h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            Enter 3 favorite songs, and we'll analyze them to create a brand new original song with a similar vibe.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center text-sm font-bold text-secondary uppercase tracking-wider group-hover:translate-x-2 transition-transform">
          Match Vibe <span className="ml-2">→</span>
        </div>
      </button>
    </div>
  );
};