import React from 'react';
import { uploadService } from '../services/uploadService';

interface AvatarProps {
    avatarUrl?: string | null;
    username: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    avatarUrl,
    username,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base'
    };

    const bgColor = uploadService.getColorFromString(username);
    const initials = uploadService.getInitials(username);

    return (
        <div
            className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        overflow-hidden
        border-2 border-white/10
        flex-shrink-0
        ${className}
      `}
            style={{ backgroundColor: avatarUrl ? 'transparent' : bgColor }}
            title={username}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={`${username}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                    }}
                />
            ) : null}
            <div
                className={`
          ${avatarUrl ? 'hidden' : 'flex'}
          w-full h-full items-center justify-center
          font-bold text-white
        `}
            >
                {initials}
            </div>
        </div>
    );
};
