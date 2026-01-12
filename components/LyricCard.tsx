
import React, { useState, useEffect, ChangeEvent } from 'react';
import { SongLyrics, LyricSection, SongRecommendation } from '../types';
import { Button } from './Button';

interface LyricCardProps {
  data: SongLyrics;
  onCopy: () => void;
  onUpdate: (data: SongLyrics) => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  onSave?: () => void;
  isSaved?: boolean;
}

// Updated gradient to use minimalist monochromatic style or subtle accents
const getGradient = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Subtle gradients
  const h1 = Math.abs(hash % 360);
  return `linear-gradient(135deg, #181818, hsl(${h1}, 60%, 15%))`;
};

// Sub-component for individual recommendations
const RecommendationItem: React.FC<{ rec: SongRecommendation }> = ({ rec }) => {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${rec.title} ${rec.artist} official audio`)}`;

  return (
    <a 
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-lg bg-surface border border-white/5 hover:border-primary/40 transition-all group h-full overflow-hidden hover:-translate-y-1 hover:shadow-lg"
      title={`Listen to ${rec.title} on YouTube`}
    >
      <div className="relative w-full aspect-video group-hover:brightness-110 transition-all duration-500 overflow-hidden bg-dark">
        <div 
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" 
          style={{ background: getGradient(rec.title) }}
        ></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white group-hover:text-black ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
           </div>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <div className="font-bold text-white text-lg mb-1 leading-tight group-hover:text-primary transition-colors">
          {rec.title}
        </div>
        <div className="text-sm text-gray-400 font-medium mb-3">{rec.artist}</div>
        <div className="text-xs text-gray-500 italic leading-relaxed mb-4 line-clamp-3">
          "{rec.reason}"
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-xs text-gray-400 group-hover:text-white transition-colors uppercase font-bold tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
             <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          Watch Official Video
        </div>
      </div>
    </a>
  );
};

export const LyricCard: React.FC<LyricCardProps> = ({ 
  data, 
  onCopy, 
  onUpdate,
  onGenerateAudio,
  isGeneratingAudio,
  onSave,
  isSaved
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<SongLyrics>(data);

  useEffect(() => {
    setEditableData(data);
    setIsEditing(false);
  }, [data]);

  const getSectionColor = (type: string) => {
    const lowerType = type.toLowerCase();
    // Minimalist colors
    if (lowerType.includes('chorus')) return 'text-white border-l-2 border-primary pl-4 bg-primary/5';
    if (lowerType.includes('bridge')) return 'text-white border-l-2 border-secondary pl-4 bg-secondary/5';
    if (lowerType.includes('outro')) return 'text-gray-400 italic border-l-2 border-gray-700 pl-4';
    return 'text-gray-300';
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    return content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/,br/gi, ',\n')
      .replace(/\.br/gi, '.\n')
      .replace(/\\n/g, '\n');
  };

  const handleSave = () => {
    onUpdate(editableData);
    setIsEditing(false);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditableData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleSectionChange = (index: number, newContent: string) => {
    setEditableData(prev => {
      const newStructure = [...prev.structure];
      newStructure[index] = { ...newStructure[index], content: newContent };
      return { ...prev, structure: newStructure };
    });
  };

  return (
    <div className="glass-panel rounded-xl p-8 max-w-3xl w-full mx-auto animate-fade-in relative overflow-hidden">
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <input
                type="text"
                value={editableData.title}
                onChange={handleTitleChange}
                className="w-full bg-transparent border-b border-white/20 text-4xl font-display font-bold text-white mb-2 tracking-tight focus:outline-none focus:border-primary transition-colors"
                placeholder="Song Title"
              />
            ) : (
              <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">{data.title}</h2>
            )}
            <p className="text-primary text-sm font-bold uppercase tracking-wider">{data.styleDescription}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onSave}
              disabled={isSaved}
              className={`p-2 rounded transition-colors group flex items-center gap-2 border border-transparent ${
                isSaved
                ? 'bg-green-500/10 text-green-500 cursor-default'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
              title={isSaved ? "Saved to Library" : "Save to Library"}
            >
              {isSaved ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold uppercase hidden sm:inline">Saved</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-xs font-bold uppercase hidden sm:inline">Save</span>
                </>
              )}
            </button>

            <button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`p-2 rounded transition-colors group flex items-center gap-2 border border-transparent ${
                isEditing 
                ? 'bg-primary/10 text-primary' 
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
              title={isEditing ? "Save changes" : "Edit lyrics"}
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-bold uppercase hidden sm:inline">Done</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs font-bold uppercase hidden sm:inline">Edit</span>
                </>
              )}
            </button>
            
            <button 
              onClick={onCopy}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group flex items-center gap-2"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {(isEditing ? editableData.structure : data.structure).map((section: LyricSection, index: number) => (
            <div key={index} className={`rounded p-3 transition-all duration-300 ${isEditing ? 'bg-transparent' : getSectionColor(section.type)}`}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-60">
                {section.type}
              </h3>
              
              {isEditing ? (
                <textarea
                  value={section.content}
                  onChange={(e) => handleSectionChange(index, e.target.value)}
                  rows={Math.max(3, section.content.split('\n').length)}
                  className="w-full bg-surface border border-white/10 rounded p-3 text-white font-sans text-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y leading-relaxed"
                />
              ) : (
                <p className="whitespace-pre-line leading-relaxed font-sans text-lg">
                  {formatContent(section.content)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Audio Generation Section */}
        <div className="mt-12 p-6 rounded-lg bg-surface border border-white/5 relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Audio Studio
            </h3>
            {data.audioUrl && <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded">Generated</span>}
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            {!data.audioUrl ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                 <p className="text-gray-400 mb-4 max-w-md">
                   {isEditing 
                     ? "Please save your edits before generating audio." 
                     : "Ready to hear this song? Generate a full audio track."}
                 </p>
                 <Button 
                   onClick={onGenerateAudio}
                   isLoading={isGeneratingAudio}
                   disabled={isEditing}
                   className="w-full sm:w-auto"
                   variant="primary"
                   icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                   }
                 >
                   {isGeneratingAudio ? 'Composing...' : 'Generate Song'}
                 </Button>
              </div>
            ) : (
              <div className="w-full bg-dark/50 rounded-lg p-4 backdrop-blur-sm border border-white/5">
                <audio controls className="w-full h-10" src={data.audioUrl}>
                  Your browser does not support the audio element.
                </audio>
                <div className="flex justify-end mt-2">
                   <a 
                     href={data.audioUrl} 
                     download={`${data.title}.mp3`}
                     className="text-xs text-primary hover:text-white flex items-center gap-1 font-bold uppercase tracking-wider transition-colors"
                     target="_blank" rel="noreferrer"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                     </svg>
                     Download MP3
                   </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/5">
            <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Vibe Match
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recommendations.map((rec, idx) => (
                <RecommendationItem key={idx} rec={rec} />
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest">Generated by LyricFlow AI</p>
        </div>
      </div>
    </div>
  );
};
