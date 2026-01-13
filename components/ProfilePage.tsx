
import React, { useEffect, useState, useRef } from 'react';
import { SavedSong, User } from '../types';
import { dbService } from '../services/dbService';
import { uploadService } from '../services/uploadService';
import { Avatar } from './Avatar';

interface ProfilePageProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  onLoadSong: (song: SavedSong) => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdate, onLoadSong, onBack }) => {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
  const [editStatus, setEditStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditStatus({ type: null, message: '' });

    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setEditStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    try {
      await dbService.updateProfile(user.id, {
        currentPassword: editForm.currentPassword,
        newEmail: editForm.newEmail || undefined,
        newPassword: editForm.newPassword || undefined
      });
      setEditStatus({ type: 'success', message: 'Profile updated successfully!' });
      setEditForm({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsEditing(false), 2000);
    } catch (err: any) {
      setEditStatus({ type: 'error', message: err.message || 'Update failed' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      // Upload to Cloudinary
      const avatarUrl = await uploadService.uploadToCloudinary(file);

      // Update user profile
      const updatedUser = await dbService.updateProfile(user.id, { avatarUrl });

      // Update preview
      setAvatarPreview(avatarUrl);

      // Update parent App component's user state
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setEditStatus({ type: 'success', message: 'Avatar updated successfully!' });
    } catch (err: any) {
      setEditStatus({ type: 'error', message: err.message || 'Failed to upload avatar' });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Avatar with Upload */}
          <div className="relative group">
            <Avatar avatarUrl={avatarPreview} username={user.username} size="lg" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold disabled:cursor-not-allowed"
              title="Change avatar"
            >
              {isUploadingAvatar ? '...' : '📷'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-white">Your Library</h2>
            <p className="text-gray-400">Welcome back, {user.username}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isEditing ? 'bg-white/10 text-white' : 'bg-surface border border-white/10 text-gray-400 hover:text-white'}`}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {isEditing && (
        <div className="bg-surface border border-white/10 rounded-xl p-6 mb-8 animate-fade-in">
          <h3 className="text-xl font-bold mb-6">Update Profile</h3>

          {editStatus.message && (
            <div className={`p-4 rounded-lg mb-6 ${editStatus.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {editStatus.message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Email</label>
              <div className="text-white bg-white/5 p-3 rounded-lg border border-white/10">{user.email}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Email (Optional)</label>
              <input
                type="email"
                value={editForm.newEmail}
                onChange={(e) => setEditForm({ ...editForm, newEmail: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter new email address"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Change Password (Optional)</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="New Password"
                />
                <input
                  type="password"
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Current Password (Required to Save)</label>
              <input
                type="password"
                required
                value={editForm.currentPassword}
                onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                className="w-full bg-black/30 border border-primary/50 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter current password to verify"
              />
            </div>

            <button type="submit" className="w-full bg-primary text-dark font-bold py-3 rounded-lg hover:brightness-110 transition-colors uppercase tracking-widest">
              Save Changes
            </button>
          </form>
        </div>
      )}

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
                style={{
                  background: song.coverArtUrl
                    ? `url(${song.coverArtUrl}) center/cover no-repeat`
                    : getGradient(song.title)
                }}
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
