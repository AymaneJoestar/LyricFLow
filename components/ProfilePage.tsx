
import React, { useEffect, useState } from 'react';
import { SavedSong, User } from '../types';
import { dbService } from '../services/dbService';

interface ProfilePageProps {
  user: User;
  onLoadSong: (song: SavedSong) => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLoadSong, onBack }) => {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await dbService.getUserSongs(user.id);
        setSongs(data);
      } catch (error) {
        console.error("Failed to load songs", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, [user.id]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Helper to generate a consistent gradient based on the song title
  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = Math.abs(hash % 360);
    const c2 = (c1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${c1}, 70%, 15%), hsl(${c2}, 70%, 25%))`;
  };

  return (
    <div className="w-full max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-display font-bold text-white">Your Library</h2>
            <p className="text-gray-400">Welcome back, {user.username}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading your masterpieces...</div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
          <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
             </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No songs yet</h3>
          <p className="text-gray-400 mb-6">Create your first lyric to see it here.</p>
          <button onClick={onBack} className="text-primary font-bold hover:text-white transition-colors">
            Start Creating &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <div 
              key={song.id}
              onClick={() => onLoadSong(song)}
              className="group cursor-pointer relative rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/30"
            >
              <div 
                className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105" 
                style={{ background: getGradient(song.title) }}
              ></div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-0"></div>

              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <div className="text-xs font-bold text-white/60 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                     {formatDate(song.createdAt)}
                   </div>
                   {song.audioUrl && (
                     <div className="text-xs font-bold text-green-400 bg-green-900/40 px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                       </svg>
                       Audio
                     </div>
                   )}
                </div>
                
                <h3 className="text-2xl font-display font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{song.styleDescription}</p>
                
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center text-sm font-bold text-white/80 group-hover:translate-x-1 transition-transform">
                  Open Song &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
