import React, { useState, useEffect, useRef } from 'react';
import { InspirationPreferences } from '../types';
import { Button } from './Button';

interface InspirationFormProps {
  onSubmit: (prefs: InspirationPreferences) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const InspirationForm: React.FC<InspirationFormProps> = ({ onSubmit, isLoading, onBack }) => {
  const [songs, setSongs] = useState<string[]>(['', '', '']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition once on mount
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAdditionalInfo((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSongChange = (index: number, value: string) => {
    const newSongs = [...songs];
    newSongs[index] = value;
    setSongs(newSongs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty strings just in case
    const validSongs = songs.filter(s => s.trim() !== '');
    if (validSongs.length < 1) {
      alert("Please enter at least one song for inspiration.");
      return;
    }
    onSubmit({ mode: 'inspiration', songs: validSongs, additionalInfo });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl w-full max-w-xl animate-fade-in-up">
      <div className="flex items-center mb-6">
        <button type="button" onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-display font-bold text-white">Vibe Matcher</h2>
      </div>

      <p className="text-gray-400 mb-6 text-sm">
        Enter 3 songs that define the style you want. We'll analyze their lyrics, rhythm, and mood to create something new.
      </p>

      <div className="space-y-4 mb-6">
        {songs.map((song, index) => (
          <div key={index}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Song Inspiration #{index + 1}
            </label>
            <input
              type="text"
              required={index === 0}
              placeholder="Song Title - Artist Name"
              className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              value={song}
              onChange={(e) => handleSongChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Additional Context (Optional)
        </label>
        <div className="relative">
          <textarea
            rows={2}
            placeholder="Any specific themes or details to include?"
            className="w-full bg-dark/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-2 top-2 p-2 rounded-full transition-all duration-200 ${
              isListening 
                ? 'text-red-500 bg-red-500/10 animate-pulse' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Use voice input"
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        isLoading={isLoading} 
        variant="primary"
        className="w-full !from-secondary !to-purple-600 !shadow-secondary/25"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        }
      >
        Match Vibe & Generate
      </Button>
    </form>
  );
};