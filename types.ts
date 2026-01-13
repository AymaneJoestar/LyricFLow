
export enum SongMood {
  Happy = 'Happy',
  Sad = 'Sad',
  Angry = 'Angry',
  Chill = 'Chill',
  Romantic = 'Romantic',
  Motivational = 'Motivational',
  Melancholic = 'Melancholic',
  Party = 'Party'
}

export enum SongGenre {
  Pop = 'Pop',
  Rock = 'Rock',
  HipHop = 'Hip-Hop',
  Country = 'Country',
  RB = 'R&B',
  EDM = 'EDM',
  Jazz = 'Jazz',
  Folk = 'Folk',
  Metal = 'Metal'
}

export interface LyricSection {
  type: string; // e.g., "Verse", "Chorus", "Bridge", "Outro"
  content: string;
}

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
}

export interface Comment {
  _id?: string; // Comment ID for referencing in replies
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  parentCommentId?: string; // Reference to parent comment for threading
  avatarUrl?: string; // Snapshot of user avatar at time of comment
}

export interface Rating {
  userId: string;
  score: number;
}

export interface SongLyrics {
  title: string;
  styleDescription: string;
  structure: LyricSection[];
  recommendations: SongRecommendation[];
  audioUrl?: string; // URL to the generated audio file
  coverArtUrl?: string; // URL for the album art
  // Community Fields
  isPublic?: boolean;
  authorName?: string;
  averageRating?: number;
  ratings?: Rating[];
  comments?: Comment[];
}

export enum SubscriptionTier {
  Free = 'free',
  Pro = 'pro'
}

export interface User {
  id: string;
  username: string;
  email: string;
  tier: SubscriptionTier;
  avatarUrl?: string;  // NEW: Profile picture URL
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  createdAt: number;
  stats: {
    publicSongs: number;
    totalComments: number;
  };
}

export interface SavedSong extends SongLyrics {
  id: string;
  userId: string;
  createdAt: number;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: SongLyrics | null;
}

export interface UserPreferences {
  mode: 'standard';
  topic: string;
  mood: SongMood;
  genre: SongGenre;
  additionalInfo: string;
}

export interface InspirationPreferences {
  mode: 'inspiration';
  songs: string[]; // Array of 3 songs
  additionalInfo: string;
}

export type GenerationInput = UserPreferences | InspirationPreferences;
