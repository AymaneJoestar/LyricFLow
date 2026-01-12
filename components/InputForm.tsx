import React, { useState, useEffect, useRef } from 'react';
import { SongGenre, SongMood, UserPreferences } from '../types';
import { Button } from './Button';

interface InputFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, onBack }) => {
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState<SongMood>(SongMood.Chill);
  const [genre, setGenre] = useState<SongGenre>(SongGenre.Pop);
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Voice Input State
  const [listeningField, setListeningField] = useState<'topic' | 'additionalInfo' | null>(null);
  
  // We use a ref to track the active field inside the event listeners
  // This avoids stale closures and re-initialization issues
  const activeFieldRef = useRef<'topic' | 'additionalInfo' | null>(null);
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
        const currentField = activeFieldRef.current;
        
        if (currentField === 'topic') {
          setTopic((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else if (currentField === 'additionalInfo') {
          setAdditionalInfo((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        
        // Reset state after result
        setListeningField(null);
        activeFieldRef.current = null;
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setListeningField(null);
        activeFieldRef.current = null;
      };

      recognition.onend = () => {
        setListeningField(null);
        activeFieldRef.current = null;
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = (field: 'topic' | 'additionalInfo') => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (listeningField === field) {
      // Stop if currently listening to this field
      recognitionRef.current.stop();
      setListeningField(null);
      activeFieldRef.current = null;
    } else {
      // If listening to another field, stop it first
      if (listeningField) {
        recognitionRef.current.stop();
      }
      
      // Start listening
      setListeningField(field);
      activeFieldRef.current = field;
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ mode: 'standard', topic, mood, genre, additionalInfo });
  };

  const renderMicButton = (field: 'topic' | 'additionalInfo', className: string) => (
    <button
      type="button"
      onClick={() => toggleListening(field)}
      className={`${className} p-2 rounded-full transition-all duration-200 ${
        listeningField === field 
          ? 'text-red-500 bg-red-500/10 animate-pulse' 
          : 'text-gray-400 hover:text-white hover:bg-white/10'
      }`}
      title={listeningField === field ? "Stop listening" : "Use voice input"}
    >
      {listeningField === field ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl w-full max-w-xl animate-fade-in-up">
      <div className="flex items-center mb-6">
        <button type="button" onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-display font-bold text-white">Custom Creation</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What is your song about?
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g., A heartbroken astronaut drifting in space..."
              className="w-full bg-dark/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            {renderMicButton('topic', 'absolute right-2 top-1/2 -translate-y-1/2')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
            <select
              className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={mood}
              onChange={(e) => setMood(e.target.value as SongMood)}
            >
              {Object.values(SongMood).map((m) => (
                <option key={m} value={m} className="bg-dark text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
            <select
              className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={genre}
              onChange={(e) => setGenre(e.target.value as SongGenre)}
            >
              {Object.values(SongGenre).map((g) => (
                <option key={g} value={g} className="bg-dark text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Context (Optional)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g., Mention the color blue, include a fast rap verse, keep it simple..."
              className="w-full bg-dark/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
            {renderMicButton('additionalInfo', 'absolute right-2 top-3')}
          </div>
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        >
          Generate Lyrics
        </Button>
      </div>
    </form>
  );
};