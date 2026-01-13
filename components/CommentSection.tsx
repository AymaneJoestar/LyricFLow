import React, { useState } from 'react';
import { Comment } from '../types';
import { Button } from './Button';
import { Avatar } from './Avatar';

interface CommentSectionProps {
    comments?: Comment[];
    onAddComment: (content: string, parentCommentId?: string) => void;
    onDeleteComment?: (commentId: string) => void;
    onUsernameClick?: (userId: string) => void;
    currentUserId?: string;
    isSubmitting: boolean;
}

// Helper to organize comments into a tree structure
const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const topLevel: Comment[] = [];

    // First pass: create a map of all comments with empty replies arrays
    comments.forEach(comment => {
        if (comment._id) {
            commentMap.set(comment._id, { ...comment, replies: [] });
        }
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
        if (comment.parentCommentId && commentMap.has(comment.parentCommentId)) {
            // This is a reply - add to parent's replies
            const parent = commentMap.get(comment.parentCommentId)!;
            if (comment._id && commentMap.has(comment._id)) {
                parent.replies.push(commentMap.get(comment._id)!);
            }
        } else if (comment._id && commentMap.has(comment._id)) {
            // This is a top-level comment
            topLevel.push(commentMap.get(comment._id)!);
        }
    });

    return topLevel;
};

interface CommentItemProps {
    comment: Comment & { replies?: Comment[] };
    onReply: (content: string, parentId: string) => void;
    onDelete?: (commentId: string) => void;
    onUsernameClick?: (userId: string) => void;
    currentUserId?: string;
    isSubmitting: boolean;
    depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onDelete, onUsernameClick, currentUserId, isSubmitting, depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const maxDepth = 3; // Max nesting level

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !comment._id) return;
        onReply(replyContent, comment._id);
        setReplyContent('');
        setShowReplyForm(false);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const isAuthor = currentUserId && comment.userId === currentUserId;

    return (
        <div className={` ${depth > 0 ? 'ml-6 mt-3 pl-4 border-l-2 border-white/10' : ''}`}>
            <div className={`bg-white/5 rounded-lg p-3 border ${isAuthor ? 'border-primary/30' : 'border-white/5'} relative group`}>
                <div className="flex gap-3 mb-2">
                    <Avatar avatarUrl={comment.avatarUrl} username={comment.username} size="sm" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onUsernameClick && comment.userId) {
                                        onUsernameClick(comment.userId);
                                    }
                                }}
                                className="font-bold text-primary text-sm hover:text-white transition-colors cursor-pointer"
                            >
                                {comment.username}
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                {isAuthor && onDelete && (
                                    <button
                                        onClick={() => onDelete(comment._id!)}
                                        className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete comment"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>

                        {/* Reply button */}
                        {depth < maxDepth && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1 mt-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Reply
                            </button>
                        )}
                    </div>
                </div>

                {/* Inline reply form */}
                {showReplyForm && (
                    <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Reply to ${comment.username}...`}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!replyContent.trim() || isSubmitting}
                            className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Post
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReplyForm(false)}
                            className="px-3 py-2 bg-white/5 text-gray-400 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>

            {/* Render nested replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {comment.replies.map((reply, idx) => (
                        <CommentItem
                            key={reply._id || idx}
                            comment={reply}
                            onReply={onReply}
                            onDelete={onDelete}
                            onUsernameClick={onUsernameClick}
                            currentUserId={currentUserId}
                            isSubmitting={isSubmitting}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ comments = [], onAddComment, onDeleteComment, onUsernameClick, currentUserId, isSubmitting }) => {
    const [newComment, setNewComment] = useState('');
    const threadedComments = buildCommentTree(comments);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment); // Top-level comment (no parentId)
        setNewComment('');
    };

    const handleReply = (content: string, parentId: string) => {
        onAddComment(content, parentId);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {threadedComments.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    threadedComments.map((comment, idx) => (
                        <CommentItem
                            key={comment._id || idx}
                            comment={comment}
                            onReply={handleReply}
                            onDelete={onDeleteComment}
                            onUsernameClick={onUsernameClick}
                            currentUserId={currentUserId}
                            isSubmitting={isSubmitting}
                        />
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 items-start pt-4 border-t border-white/10">
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
