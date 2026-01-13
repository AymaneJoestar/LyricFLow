
import React from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTakeSurvey: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onTakeSurvey }) => {
    if (!isOpen) return null;

    const FORM_URL = "https://forms.gle/iuDZjMhuhouUjmudA";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center">
                    <div className="h-12 w-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </div>

                    <h2 className="text-2xl font-bold font-display mb-2">We value your feedback!</h2>
                    <p className="text-gray-400 mb-6">Help us improve LyricFlow by letting us know what you think.</p>

                    <div className="flex flex-col gap-3">
                        <a
                            href={FORM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:brightness-110 transition-all text-center"
                            onClick={onTakeSurvey}
                        >
                            Take Survey
                        </a>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-gray-400 hover:text-white font-bold transition-all"
                        >
                            No, thanks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
