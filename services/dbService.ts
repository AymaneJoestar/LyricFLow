
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
      const newUser = { id: `local_${Date.now()}`, username, email, tier: 'free' };
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
  },

  upgradeTier: async (userId: string, tier: 'free' | 'pro'): Promise<User> => {
    const apiCall = () => fetch(`${API_URL}/users/${userId}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });

    const fallback = async () => {
      // ... existing fallback ...
      const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].tier = tier;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        return users[userIndex];
      }
      throw new Error("User not found locally");
    };
    return fetchWithFallback(apiCall, fallback);
  },

  updateProfile: async (userId: string, data: { currentPassword: string, newEmail?: string, newPassword?: string }): Promise<User> => {
    const apiCall = () => fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const fallback = async () => {
      const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex === -1) throw new Error('User not found');

      const user = users[userIndex];
      // Check password
      if (user.password !== data.currentPassword) throw new Error('Incorrect current password');

      // Update fields
      if (data.newEmail) user.email = data.newEmail;
      if (data.newPassword) user.password = data.newPassword;

      users[userIndex] = user;
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    };

    return fetchWithFallback(apiCall, fallback);
  },

  // --- SOCIAL FEATURES ---

  getPublicSongs: async (sort: 'new' | 'top' = 'new'): Promise<SavedSong[]> => {
    const apiCall = () => fetch(`${API_URL}/public/songs?sort=${sort}`);
    const fallback = async () => []; // No offline support for community yet
    return fetchWithFallback(apiCall, fallback);
  },

  toggleShare: async (songId: string, isPublic: boolean): Promise<SavedSong> => {
    const apiCall = () => fetch(`${API_URL}/songs/${songId}/share`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic })
    });
    // Reuse general update logic for fallback if needed, or just return mock
    return fetchWithFallback(apiCall, async () => { throw new Error("Online only"); });
  },

  addComment: async (songId: string, userId: string, username: string, content: string): Promise<SavedSong> => {
    const apiCall = () => fetch(`${API_URL}/songs/${songId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, content })
    });
    return fetchWithFallback(apiCall, async () => { throw new Error("Online only"); });
  },

  rateSong: async (songId: string, userId: string, score: number): Promise<SavedSong> => {
    const apiCall = () => fetch(`${API_URL}/songs/${songId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score })
    });
    return fetchWithFallback(apiCall, async () => { throw new Error("Online only"); });
  }
};
