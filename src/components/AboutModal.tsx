import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Compass, X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2C1E18]/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="bg-[#F6F1E7] parchment-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-[#5A1A24] relative z-10 custom-scrollbar text-[#2C1E18]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#5A1A24]/10 text-[#5A1A24] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-7 sm:p-9">
              <div className="flex flex-col items-center text-center mb-7">
                <div className="w-14 h-14 bg-[#5A1A24] border-2 border-[#C89D54] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <Compass className="w-7 h-7 text-[#EBD197]" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#5A1A24] tracking-tight mb-2">
                  Il Grand Tour di Ana · API Guide
                </h2>
                <p className="text-[#6E5A4F] text-sm leading-relaxed max-w-sm mx-auto">
                  Explore Ana’s 39 curated locations across Florence and Rome using Google Maps Platform and Gemini Grounding.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5 bg-[#FBF8F3] p-4 rounded-xl border border-[#D5C7AD]">
                  <p className="text-[11px] font-mono font-bold text-[#846024] uppercase tracking-wider">
                    Google Maps Platform &amp; AI Services Used:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#2C1E18]">
                    <li>Maps JavaScript API (Advanced Markers, Vector Map &amp; Polylines)</li>
                    <li>Weather API (Live Florence &amp; Rome Current Conditions &amp; 3-Day Forecast)</li>
                    <li>Routes API (Optional automatic walking trail upgrade with standard key)</li>
                    <li>Gemini 3.8 Flash with Google Maps Grounding &amp; Google Search Grounding</li>
                  </ul>
                </div>

                <div className="bg-[#EFE7D6] rounded-xl p-5 border border-[#C89D54]">
                  <p className="text-xs text-[#2C1E18] leading-relaxed mb-4">
                    You can power this applet with a credit-card-free{' '}
                    <a
                      href="https://developers.google.com/maps/demo-key?utm_source=ai-studio&utm_medium=website&utm_campaign=gmp_mcp_codeassist_v1_aistudio&utm_content=maps-demo-key_api-key-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#5A1A24] underline"
                    >
                      Maps Demo Key
                    </a>{' '}
                    or provide a{' '}
                    <a
                      href="https://developers.google.com/maps/get-started?utm_source=ai-studio&utm_medium=website&utm_campaign=gmp_mcp_codeassist_v1_aistudio&utm_content=maps-standard-key_api-key-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#5A1A24] underline"
                    >
                      standard API Key
                    </a>{' '}
                    to unlock street-level Routes API paths.
                  </p>

                  <a
                    href="https://developers.google.com/maps/demo-key?utm_source=ai-studio&utm_medium=website&utm_campaign=gmp_mcp_codeassist_v1_aistudio&utm_content=maps-demo-key_api-key-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#5A1A24] hover:bg-[#46131B] text-[#F6F1E7] font-semibold py-3 rounded-xl transition-all text-xs"
                  >
                    <span>Get a Maps Demo Key</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-[#2C1E18] hover:bg-[#46131B] text-[#F6F1E7] font-serif font-bold py-3.5 rounded-xl transition-colors text-lg cursor-pointer"
                >
                  Return to Il Grand Tour
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
