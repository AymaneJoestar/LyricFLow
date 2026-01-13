import React from 'react';

interface AdBannerProps {
    show: boolean;
    position?: 'top' | 'bottom' | 'inline';
    onUpgradeClick?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ show, position = 'inline', onUpgradeClick }) => {
    if (!show) return null;

    return (
        <div className={`ad-banner ${position === 'inline' ? 'my-6' : position === 'top' ? 'mb-6' : 'mt-6'} max-w-2xl w-full`}>
            <div className="bg-surface/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-3">Advertisement</p>

                {/* Placeholder Ad - Replace with Google AdSense */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px] border border-white/5">
                    <div className="text-center">
                        <svg className="h-12 w-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        <p className="text-gray-500 text-sm font-medium mb-1">Advertisement Space</p>
                        <p className="text-gray-600 text-xs">728x90 Banner</p>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 mb-2">
                        Tired of ads?
                    </p>
                    <button
                        onClick={onUpgradeClick}
                        className="text-xs font-bold text-primary hover:brightness-125 transition-colors uppercase tracking-wider"
                    >
                        Upgrade to Pro for Ad-Free Experience →
                    </button>
                </div>
            </div>

            {/* 
        TODO: Replace placeholder with Google AdSense
        
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-XXXXXXXXXX"
             data-ad-slot="YYYYYYYYYY"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      */}
        </div>
    );
};
