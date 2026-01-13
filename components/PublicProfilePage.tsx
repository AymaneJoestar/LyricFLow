import React, { useEffect, useState } from 'react';
import { UserProfile, SavedSong } from '../types';
import { dbService } from '../services/dbService';
import { Avatar } from './Avatar';
import { LyricCard } from './LyricCard';

interface PublicProfilePageProps {
    userId: string;
    onViewSong: (song: SavedSong) => void;
    onBack: () => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ userId, onViewSong, onBack }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [songs, setSongs] = useState<SavedSong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [profileData, songsData] = await Promise.all([
                    dbService.getUserProfile(userId),
                    dbService.getUserPublicSongs(userId)
                ]);
                setProfile(profileData);
                setSongs(songsData);
            } catch (err: any) {
                console.error('Failed to load profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [userId]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short', year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-5xl animate-fade-in">
                <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                <div className="flex justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="w-full max-w-5xl animate-fade-in">
                <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-2xl text-red-400 font-display mb-4">Profile Not Found</p>
                    <p className="text-gray-400">{error || 'This user does not exist.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl animate-fade-in">
            {/* Back Button */}
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>

            {/* Profile Header */}
            <div className="bg-surface border border-white/10 rounded-xl p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar avatarUrl={profile.avatarUrl} username={profile.username} size="lg" className="w-24 h-24" />

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-display font-bold text-white mb-2">{profile.username}</h1>
                        <p className="text-gray-400 mb-4">Member since {formatDate(profile.createdAt)}</p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                                <div className="text-2xl font-bold text-primary">{profile.stats.publicSongs}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Public Songs</div>
                            </div>
                            <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                                <div className="text-2xl font-bold text-secondary">{profile.stats.totalComments}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Comments</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Public Songs */}
            <div>
                <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Public Songs
                </h2>

                {songs.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No public songs yet</h3>
                        <p className="text-gray-400">{profile.username} hasn't shared any songs publicly.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {songs.map((song) => (
                            <div key={song.id} onClick={() => onViewSong(song)}>
                                <LyricCard
                                    data={song}
                                    onCopy={() => { }}
                                    onUpdate={() => { }}
                                    onGenerateAudio={() => { }}
                                    isGeneratingAudio={false}
                                    readOnly={true}
                                    minimized={true}
                                    onExpand={() => onViewSong(song)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
