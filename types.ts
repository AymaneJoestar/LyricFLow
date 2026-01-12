
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

export interface SongLyrics {
  title: string;
  styleDescription: string;
  structure: LyricSection[];
  recommendations: SongRecommendation[];
  audioUrl?: string; // URL to the generated audio file
}

export interface User {
  id: string;
  username: string;
  email: string;
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
