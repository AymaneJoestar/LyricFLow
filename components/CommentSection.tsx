
import React, { useState } from 'react';
import { Comment } from '../types';
import { Button } from './Button';

interface CommentSectionProps {
    comments?: Comment[];
    onAddComment: (content: string) => void;
    isSubmitting: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments = [], onAddComment, isSubmitting }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment('');
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>💬</span> Discussion ({comments.length})
            </h3>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-primary text-sm">{comment.username}</span>
                                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-4 pt-4 border-t border-white/10">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this masterpiece..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none h-20"
                    required
                />
                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={!newComment.trim()}
                    className="h-20"
                >
                    Post
                </Button>
            </form>
        </div>
    );
};
