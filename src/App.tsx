/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import AboutModal from './components/AboutModal';
import MapComponent from './components/MapComponent';
import { Loader2, Compass } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    checkApiKey();

    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const checkApiKey = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        return true;
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    } finally {
      setChecking(false);
    }
    return false;
  };

  // Poll for API key if not yet configured in Secrets
  useEffect(() => {
    if (apiKey || checking) return;

    const interval = setInterval(async () => {
      const found = await checkApiKey();
      if (found) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [apiKey, checking]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F1E7] text-[#5A1A24] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1A24]" />
        <p className="font-serif italic text-lg">Unfurling the Grand Tour Atlas…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F6F1E7] text-[#2C1E18]">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

      <div className="flex-1 relative overflow-hidden">
        {apiKey ? (
          <MapComponent apiKey={apiKey} onOpenAbout={() => setShowAboutModal(true)} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#F6F1E7] parchment-surface">
            <div className="max-w-md w-full bg-[#FBF8F3] border-2 border-[#5A1A24] rounded-2xl p-8 shadow-xl space-y-5">
              <div className="w-14 h-14 bg-[#5A1A24] border-2 border-[#C89D54] rounded-2xl flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7 text-[#EBD197]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-[#846024]">
                  Il Grand Tour di Ana
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#5A1A24]">
                  Google Maps Key Required
                </h1>
              </div>
              <p className="text-sm text-[#4A372F] leading-relaxed">
                To illuminate the 39 quest markers across Firenze and Roma, add your{' '}
                <code className="bg-[#EFE7D6] px-1.5 py-0.5 rounded font-mono text-xs text-[#5A1A24]">
                  GOOGLE_MAPS_API_KEY
                </code>{' '}
                in the AI Studio <strong>Secrets</strong> panel.
              </p>
              <div className="p-4 bg-[#EFE7D6] rounded-xl border border-[#D5C7AD] text-xs text-left space-y-1.5 text-[#2C1E18]">
                <p className="font-bold text-[#5A1A24]">Quick Setup:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open <strong>Settings → Secrets</strong> in AI Studio</li>
                  <li>
                    Add <code className="font-mono font-semibold">GOOGLE_MAPS_API_KEY</code>
                  </li>
                  <li>Paste a Maps Demo Key or your standard Google Maps API Key</li>
                </ol>
              </div>
              <button
                onClick={() => setShowAboutModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5A1A24] text-[#F6F1E7] text-xs font-semibold hover:bg-[#46131B] transition-colors cursor-pointer"
              >
                How to Get a Demo or Standard Key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
