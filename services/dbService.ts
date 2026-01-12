
import { SavedSong, SongLyrics, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || '/api';
const CURRENT_USER_KEY = 'lyricflow_current_user';
const LOCAL_USERS_KEY = 'lyricflow_local_users';
const LOCAL_SONGS_KEY = 'lyricflow_local_songs';

async function fetchWithFallback(apiCall: () => Promise<Response>, fallback: () => Promise<any>): Promise<any> {
  try {
    const response = await apiCall();
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }
    return response.json();
  } catch (error: any) {
    console.warn("Backend unavailable, using fallback:", error.message);
    return fallback();
  }
}

export const dbService = {
  checkHealth: async (): Promise<{ online: boolean; dbConnected: boolean }> => {
    try {
      const response = await fetch(`${API_URL}/health`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        return {
          online: data.server === 'online',
          dbConnected: data.database === 'connected'
        };
      }
      return { online: false, dbConnected: false };
    } catch (e) {
      return { online: false, dbConnected: false };
    }
  },

  register: async (email: string, username: string, password: string): Promise<User> => {
    const apiCall = () => fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    const fallback = async () => {
      const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      if (users.find((u: any) => u.email === email)) throw new Error('User exists (Offline)');
      const newUser = { id: `local_${Date.now()}`, username, email };
      users.push({ ...newUser, password });
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return newUser;
    };
    return fetchWithFallback(apiCall, fallback);
  },

  login: async (email: string, password: string): Promise<User> => {
    const apiCall = () => fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const fallback = async () => {
      const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid credentials (Offline Mode)');
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    };
    return fetchWithFallback(apiCall, fallback);
  },

  logout: () => localStorage.removeItem(CURRENT_USER_KEY),
  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'),

  saveSong: async (userId: string, songData: SongLyrics): Promise<SavedSong> => {
    const apiCall = () => fetch(`${API_URL}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...songData })
    });
    const fallback = async () => {
      const allSongs = JSON.parse(localStorage.getItem(LOCAL_SONGS_KEY) || '[]');
      const newSong = { ...songData, id: `local_${Date.now()}`, userId, createdAt: Date.now() };
      allSongs.push(newSong);
      localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(allSongs));
      return newSong;
    };
    return fetchWithFallback(apiCall, fallback);
  },

  updateSong: async (songId: string, songData: Partial<SavedSong>): Promise<SavedSong> => {
    const apiCall = () => fetch(`${API_URL}/songs/${songId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData)
    });
    const fallback = async () => {
      const allSongs = JSON.parse(localStorage.getItem(LOCAL_SONGS_KEY) || '[]');
      const index = allSongs.findIndex((s: any) => s.id === songId || s._id === songId);
      if (index !== -1) {
        allSongs[index] = { ...allSongs[index], ...songData };
        localStorage.setItem(LOCAL_SONGS_KEY, JSON.stringify(allSongs));
        return allSongs[index];
      }
      throw new Error("Song not found locally");
    };
    return fetchWithFallback(apiCall, fallback);
  },

  getUserSongs: async (userId: string): Promise<SavedSong[]> => {
    const apiCall = () => fetch(`${API_URL}/songs/${userId}`);
    const fallback = async () => {
      const allSongs = JSON.parse(localStorage.getItem(LOCAL_SONGS_KEY) || '[]');
      return allSongs.filter((s: any) => s.userId === userId);
    };
    return fetchWithFallback(apiCall, fallback);
  }
};
