import React from 'react';
import { SubscriptionTier } from '../types';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: SubscriptionTier;
    onUpgrade: (tier: SubscriptionTier) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentTier, onUpgrade }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-4xl w-full animate-fade-in relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-display font-bold mb-2">
                    Choose Your Plan
                </h2>
                <p className="text-gray-400 mb-8">
                    Unlock more audio generations with Pro
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Free Tier Card */}
                    <div className={`border ${currentTier === SubscriptionTier.Free ? 'border-primary/50' : 'border-white/10'} rounded-xl p-6 transition-all`}>
                        <h3 className="text-xl font-bold mb-4">Free</h3>
                        <p className="text-4xl font-bold mb-6">$0<span className="text-sm text-gray-400">/forever</span></p>
                        <ul className="space-y-3 text-sm mb-6 text-gray-300">
                            <li>✅ Unlimited lyrics generation</li>
                            <li>❌ <strong>0 audio generations</strong></li>
                            <li>✅ Unlimited song saves</li>
                        </ul>
                    </div>

                    {/* Pro Tier Card */}
                    <div className={`border-2 border-primary rounded-xl p-6 bg-primary/5 relative overflow-hidden transition-all`}>
                        <h3 className="text-xl font-bold text-primary mb-4">Pro</h3>
                        <p className="text-4xl font-bold mb-6">$5<span className="text-sm text-gray-400">/month</span></p>
                        <ul className="space-y-3 text-sm mb-6 text-gray-200">
                            <li>✅ Unlimited lyrics generation</li>
                            <li>✅ <strong>10 audio generations</strong></li>
                            <li>✅ Unlimited song saves</li>
                            <li>✅ Priority support</li>
                        </ul>

                        {currentTier === SubscriptionTier.Free && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.open('https://instagram.com/_aymaneab', '_blank')}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-1.082 2H10.5c-2.4 0-2.5.01-3.6.06-1.0.05-1.6.2-2.2.4a3.1 3.1 0 00-1.2.7c-.4.4-.6.8-.7 1.2-.2.6-.4 1.2-.4 2.2-.05 1.1-.06 1.2-.06 3.6 0 2.4.01 2.5.06 3.6.05 1.0.2 1.6.4 2.2.165.42.365.795.7 1.2.4.4.8.6 1.2.7.6.2 1.2.4 2.2.4 1.1.05 1.2.06 3.6.06 2.4 0 2.5-.01 3.6-.06 1.0-.05 1.6-.2 2.2-.4a3.1 3.1 0 001.2-.7c.4-.4.6-.8.7-1.2.2-.6.4-1.2.4-2.2.05-1.1.06-1.2.06-3.6 0-2.4-.01-2.5-.06-3.6-.05-1.0-.2-1.6-.4-2.2a2.9 2.9 0 00-.7-1.2 3 3 0 00-1.2-.7c-.6-.2-1.2-.4-2.2-.4-1.1-.05-1.2-.06-3.6-.06zm1.082 3.8a4.2 4.2 0 110 8.4 4.2 4.2 0 010-8.4zm0 2a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zm5.4-3.6a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8z" clipRule="evenodd" /></svg>
                                    Contact @_aymaneab
                                </button>
                                <p className="text-xs text-center text-gray-400">
                                    Send a DM to upgrade your account instantly!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};
