import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { LyricCard } from './LyricCard';
import { SavedSong } from '../types';

interface CommunityPageProps {
    onViewSong: (song: SavedSong) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onViewSong }) => {
    const [songs, setSongs] = useState<SavedSong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState<'new' | 'top'>('new');
    const currentUser = dbService.getCurrentUser();

    useEffect(() => {
        loadSongs();
    }, [sort]);

    const loadSongs = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getPublicSongs(sort);
            setSongs(data);
        } catch (error) {
            console.error("Failed to load community songs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-32 max-w-7xl animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Community Feed</h1>
                    <p className="text-gray-400">Discover masterpieces created by other lyricists.</p>
                </div>

                <div className="flex bg-white/5 rounded-lg p-1 gap-1 mt-4 md:mt-0">
                    <button
                        onClick={() => setSort('new')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${sort === 'new' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setSort('top')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${sort === 'top' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Top Rated
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : songs.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-2xl text-gray-500 font-display mb-4">It's quiet here...</p>
                    <p className="text-gray-400">Be the first to share your song with the world!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {songs.map((song) => (
                        <div key={song.id}>
                            <LyricCard
                                data={song}
                                onCopy={() => { }}
                                onUpdate={() => { }}
                                onGenerateAudio={() => { }}
                                isGeneratingAudio={false}
                                readOnly={true}
                                currentUser={currentUser ? { id: currentUser.id, username: currentUser.username } : undefined}
                                minimized={true}
                                onExpand={() => onViewSong(song)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
