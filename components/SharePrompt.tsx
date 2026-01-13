import React from 'react';

interface SharePromptProps {
    songTitle: string;
    onShare: () => void;
    onClose: () => void;
}

export const SharePrompt: React.FC<SharePromptProps> = ({ songTitle, onShare, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Background Gradient Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="text-center relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce-slow">
                        🎉
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Masterpiece Created!</h3>
                    <p className="text-gray-400 mb-6">
                        "<span className="text-white font-medium">{songTitle}</span>" is looking great.
                        <br />
                        Why not share it with the community?
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onShare}
                            className="w-full py-3 px-4 bg-primary text-black font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>🚀 Share with Community</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-white/5 text-gray-400 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
