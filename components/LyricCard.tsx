import React, { useState, useEffect, ChangeEvent } from 'react';
import { SongLyrics, LyricSection, SongRecommendation } from '../types';
import { Button } from './Button';
import { generateCoverArtUrl } from '../services/imageService';
import { StarRating } from './StarRating';
import { CommentSection } from './CommentSection';
import { dbService } from '../services/dbService';

interface LyricCardProps {
  data: SongLyrics;
  onCopy: () => void;
  onUpdate: (data: SongLyrics) => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  onSave?: () => void;
  isSaved?: boolean;
  readOnly?: boolean;
  currentUser?: { id: string; username: string };
  onToggleShare?: (isPublic: boolean) => void;
  minimized?: boolean;
  onExpand?: () => void;
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
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
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
  isSaved,
  readOnly = false,
  currentUser,
  onToggleShare,
  minimized = false,
  onExpand
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<SongLyrics>(data);
  const [coverArt, setCoverArt] = useState<string | null>(data.coverArtUrl || null);
  const [isGeneraringArt, setIsGeneratingArt] = useState(false);

  // Community State
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setEditableData(data);
    setCoverArt(data.coverArtUrl || null);
    setIsEditing(false);
  }, [data]);

  const handleRate = async (score: number) => {
    if (!currentUser || !onUpdate) return;
    try {
      if (data['id']) {
        await dbService.rateSong(data['id'], currentUser.id, score);
        // Optimistic update would require more complex prop drilling or re-fetch
        // For now, let's assume parent re-fetches or we just show feedback
        alert(`Rated ${score} stars!`);
      }
    } catch (e) { console.error(e); }
  };

  const handleAddComment = async (content: string) => {
    if (!currentUser) return;
    setIsSubmittingComment(true);
    try {
      if (data['id']) {
        await dbService.addComment(data['id'], currentUser.id, currentUser.username, content);
        alert("Comment posted!");
      } else {
        alert("Cannot comment on unsaved song");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleGenerateArt = async () => {
    setIsGeneratingArt(true);
    try {
      // Generate unique art based on song details
      const url = generateCoverArtUrl(
        data.title,
        'artistic', // Mood placeholder (could be derived if we had it in data)
        data.styleDescription,
        `${data.title} song cover`
      );

      // Pre-load image
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setCoverArt(url);
        onUpdate({ ...data, coverArtUrl: url }); // Auto-save update
        setIsGeneratingArt(false);
      };
      img.onerror = () => {
        setIsGeneratingArt(false);
        alert("Failed to load generated image.");
      };
    } catch (e) {
      setIsGeneratingArt(false);
    }
  };

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

  // Minimized Mode - Compact Community Card
  if (minimized) {
    return (
      <div
        onClick={onExpand}
        className="glass-panel rounded-xl p-6 max-w-sm w-full cursor-pointer hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group"
      >
        <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-4">
          {coverArt ? (
            <img src={coverArt} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: getGradient(data.title) }}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <div>
              <h3 className="text-xl font-display font-bold text-white mb-1">{data.title}</h3>
              <p className="text-sm text-gray-300">{data.authorName || 'Anonymous'}</p>
            </div>
          </div>
        </div>

        {data.audioUrl && (
          <div className="mb-3">
            <audio
              controls
              className="w-full h-10"
              src={data.audioUrl}
              onClick={(e) => e.stopPropagation()}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(data.averageRating || 0)} readOnly={true} onRate={() => { }} />
            <span>({data.ratings?.length || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {data.comments?.length || 0}
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-primary font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view full song →
        </div>
      </div>
    );
  }

  // Full Mode
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
            {!readOnly && (
              <>
                <button
                  onClick={onSave}
                  disabled={isSaved}
                  className={`p-2 rounded transition-colors group flex items-center gap-2 border border-transparent ${isSaved
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
                  className={`p-2 rounded transition-colors group flex items-center gap-2 border border-transparent ${isEditing
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
              </>
            )}

            {!readOnly && (
              <button
                onClick={onCopy}
                className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group flex items-center gap-2"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}

            {/* Share Toggle for Owner */}
            {onToggleShare && !readOnly && (
              <button
                onClick={() => onToggleShare && onToggleShare(!data.isPublic)}
                className={`p-2 rounded transition-colors group flex items-center gap-2 border border-transparent ${data.isPublic ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-gray-400'
                  }`}
                title={data.isPublic ? "Public: Everyone can see this" : "Private: Only you see this"}
              >
                <span className="text-xs font-bold uppercase hidden sm:inline">{data.isPublic ? 'Public' : 'Private'}</span>
                {data.isPublic ? '🌍' : '🔒'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rating Header Display */}
      {readOnly && (
        <div className="flex items-center gap-2 mb-6">
          <StarRating
            rating={Math.round(data.averageRating || 0)}
            readOnly={!currentUser}
            onRate={handleRate}
          />
          <span className="text-sm text-gray-400">({data.ratings?.length || 0} reviews)</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-400">By {data.authorName || 'Anonymous'}</span>
        </div>
      )}

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

        <div className="flex flex-col gap-8 relative z-10">
          {/* Album Art Section - Integrated into Audio Studio */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-48 aspect-square rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0 group">
              {coverArt ? (
                <>
                  <img src={coverArt} alt="Album Art" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href={coverArt} download="cover_art.jpg" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white" title="Download Art">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                    {!readOnly && (
                      <button onClick={handleGenerateArt} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white" title="Regenerate Art">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {!readOnly ? (
                    <button
                      onClick={handleGenerateArt}
                      disabled={isGeneraringArt}
                      className="text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-widest"
                    >
                      {isGeneraringArt ? 'Painting...' : 'Generate Art'}
                    </button>
                  ) : <span className="text-xs text-gray-600">No Art</span>}
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
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

          {/* Comments Section Toggle */}
          {readOnly && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span>{showComments ? 'Hide' : 'Show'} Comments ({data.comments?.length || 0})</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showComments ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showComments && (
                <div className="mt-6 animate-fade-in">
                  <CommentSection
                    comments={data.comments}
                    onAddComment={handleAddComment}
                    isSubmitting={isSubmittingComment}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest">Generated by LyricFlow AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};
