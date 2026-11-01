import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Award, Train, CheckCircle2, Sparkles, BookOpen, MapPin } from 'lucide-react';
import { ChapterId, GRAND_TOUR_BADGES, ITALY_PLACES } from '../data/italyPlaces';
import { QuestCategoryIcon } from './QuestIcons';

interface LevelSelectModalProps {
  isOpen: boolean;
  onSelectChapter: (chapter: ChapterId, stageIso?: string) => void;
  onClose: () => void;
  visitedIds: string[];
}

export default function LevelSelectModal({
  isOpen,
  onSelectChapter,
  onClose,
  visitedIds,
}: LevelSelectModalProps) {
  const firenzePlaces = ITALY_PLACES.filter((p) => p.chapter === 'firenze');
  const romaPlaces = ITALY_PLACES.filter((p) => p.chapter === 'roma');

  const firenzeVisited = firenzePlaces.filter((p) => visitedIds.includes(p.id)).length;
  const romaVisited = romaPlaces.filter((p) => visitedIds.includes(p.id)).length;

  const firenzePct = Math.round((firenzeVisited / firenzePlaces.length) * 100);
  const romaPct = Math.round((romaVisited / romaPlaces.length) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#2C1E18]/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl rounded-2xl bg-[#F6F1E7] parchment-surface border-2 border-[#5A1A24] shadow-2xl overflow-hidden text-[#2C1E18] my-auto max-h-[94vh] flex flex-col"
          >
            {/* Ornate Double Inner Frame */}
            <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#C89D54]/70 z-20" />

            {/* Illuminated Header */}
            <div className="relative px-6 pt-7 pb-5 sm:px-10 sm:pt-8 sm:pb-6 border-b border-[#D5C7AD] bg-[#EFE7D6]/70 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-[0.22em] text-[#5A1A24] mb-1.5">
                <span>ANNO DOMINI MMXXVI</span>
                <span aria-hidden="true">·</span>
                <span>NOV 17 – DEC 2</span>
                <span aria-hidden="true">·</span>
                <span>39 CANONICAL LOCATIONS</span>
              </div>
              <h1
                className="font-serif text-3xl sm:text-5xl font-bold text-[#5A1A24] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Il Grand Tour di Ana
              </h1>
              <p className="mt-2 text-sm sm:text-base font-serif italic text-[#6E5A4F] max-w-2xl mx-auto">
                An illuminated cartographic chronicle of Renaissance Florence, the Apennine Colossus of Pratolino, and Eternal Rome.
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">
              {/* Two Chapters Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* CHAPTER I · FIRENZE */}
                <div className="group relative flex flex-col justify-between rounded-xl bg-[#FBF8F3] border border-[#5A1A24]/30 hover:border-[#5A1A24] p-6 transition-all shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#846024] mb-2">
                      <span>CHAPTER I · LEVEL I–VII</span>
                      <span className="tabular-nums">Nov 17 – Nov 24, 2026</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A1A24] flex items-center gap-2.5">
                      <QuestCategoryIcon type="dome" className="w-7 h-7 text-[#5A1A24] shrink-0" />
                      <span>Firenze &amp; Pratolino</span>
                    </h2>
                    <p className="mt-2 text-sm text-[#4A372F] leading-relaxed">
                      Begin at <strong className="font-semibold text-[#5A1A24]">Hotel Cellai</strong> and <strong className="font-semibold text-[#5A1A24]">Gold Artè Collection</strong>. Trace Artemisia Gentileschi at Museo degli Innocenti, ascend to Giambologna’s mountain giant in Vaglia, and explore Palazzo Strozzi and Santa Maria Novella.
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#E3D5BC] text-xs text-[#6E5A4F] space-y-1">
                      <div>
                        <span className="font-semibold text-[#2C1E18]">Home Bases:</span> Hotel Cellai (Nov 17–22) · Gold Artè Collection (Nov 22–24)
                      </div>
                      <div>
                        <span className="font-semibold text-[#2C1E18]">Key Quests:</span> Santissima Annunziata · Museo degli Innocenti · Parco di Pratolino · Palazzo Strozzi · Museo Novecento
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#D5C7AD]">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="font-semibold text-[#5A1A24]">
                        Firenze {firenzeVisited}/{firenzePlaces.length} conquered
                      </span>
                      <span className="tabular-nums text-[#846024]">{firenzePct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#E3D5BC] overflow-hidden mb-4">
                      <div
                        className="h-full bg-[#5A1A24] transition-all duration-300"
                        style={{ width: `${firenzePct}%` }}
                      />
                    </div>
                    <button
                      onClick={() => onSelectChapter('firenze', '2026-11-17')}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#5A1A24] hover:bg-[#46131B] text-[#F6F1E7] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Enter Chapter I · Firenze</span>
                    </button>
                  </div>
                </div>

                {/* CHAPTER II · ROMA */}
                <div className="group relative flex flex-col justify-between rounded-xl bg-[#FBF8F3] border border-[#C89D54] hover:border-[#5A1A24] p-6 transition-all shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#846024] mb-2">
                      <span>CHAPTER II · LEVEL VIII–XVI</span>
                      <span className="tabular-nums">Nov 24 – Dec 2, 2026</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A1A24] flex items-center gap-2.5">
                      <QuestCategoryIcon type="temple" className="w-7 h-7 text-[#C89D54] shrink-0" />
                      <span>Roma · Caput Mundi</span>
                    </h2>
                    <p className="mt-2 text-sm text-[#4A372F] leading-relaxed">
                      Anchor at <strong className="font-semibold text-[#5A1A24]">Ruby Giulia Hotel Rome</strong>. Challenge the Boss Level at <strong className="font-semibold text-[#846024]">★ Galleria Borghese</strong>, traverse the Capitoline Hill, Campus Martius, Trastevere, Doria Pamphilj, and the Augustan Ara Pacis.
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#E3D5BC] text-xs text-[#6E5A4F] space-y-1">
                      <div>
                        <span className="font-semibold text-[#2C1E18]">Home Base:</span> Ruby Giulia Hotel Rome (Via Agostino Depretis 45a)
                      </div>
                      <div>
                        <span className="font-semibold text-[#846024]">★ Boss Level:</span> Galleria Borghese (Nov 25, 09:00 · Favourite Gallery)
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#D5C7AD]">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="font-semibold text-[#5A1A24]">
                        Roma {romaVisited}/{romaPlaces.length} conquered
                      </span>
                      <span className="tabular-nums text-[#846024]">{romaPct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#E3D5BC] overflow-hidden mb-4">
                      <div
                        className="h-full bg-[#C89D54] transition-all duration-300"
                        style={{ width: `${romaPct}%` }}
                      />
                    </div>
                    <button
                      onClick={() => onSelectChapter('roma', '2026-11-25')}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#5A1A24] hover:bg-[#46131B] text-[#F6F1E7] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 text-[#DFB76C]" />
                      <span>Enter Chapter II · Roma</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Inter-City Train Stage Banner & Achievements Strip */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-xl bg-[#EFE7D6] border border-[#D5C7AD] p-4 sm:p-5">
                <div className="lg:col-span-5 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[#5A1A24] text-[#F6F1E7] shrink-0 mt-0.5">
                    <Train className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#846024]">SPECIAL STAGE · TUE NOV 24</div>
                    <h3 className="font-serif font-bold text-lg text-[#5A1A24]">
                      The Firenze → Roma Express
                    </h3>
                    <p className="text-xs text-[#4A372F] mt-0.5">
                      Watch the animated high-speed rail trail from Santa Maria Novella to Roma Termini.
                    </p>
                    <button
                      onClick={() => onSelectChapter('roma', '2026-11-24')}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A1A24] underline hover:text-[#846024] cursor-pointer"
                    >
                      <span>Launch Nov 24 Train Stage</span>
                    </button>
                  </div>
                </div>

                {/* 3 Badges Status */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-[#D5C7AD] pt-3 lg:pt-0 lg:pl-5">
                  {GRAND_TOUR_BADGES.map((badge) => {
                    const status = badge.checkUnlocked(visitedIds);
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-lg p-3 border transition-colors ${
                          status.unlocked
                            ? 'bg-[#FBF8F3] border-[#C89D54] text-[#2C1E18]'
                            : 'bg-[#F6F1E7]/60 border-[#D5C7AD] text-[#6E5A4F]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-serif font-bold text-sm text-[#5A1A24] truncate">
                            {badge.title}
                          </span>
                          {status.unlocked ? (
                            <CheckCircle2 className="w-4 h-4 text-[#C89D54] shrink-0" />
                          ) : (
                            <Award className="w-4 h-4 text-[#B8A483] shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] leading-snug line-clamp-2">{badge.subtitle}</div>
                        <div className="mt-1.5 text-[10px] font-mono tabular-nums text-[#846024]">
                          {status.progress}/{status.total} {status.unlocked ? '· UNLOCKED' : 'completed'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend of Custom Quest Markers */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#6E5A4F] pt-1">
                <span className="font-semibold text-[#5A1A24]">Cartographic Legend:</span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="lodging" className="w-4 h-4 text-[#846024]" />
                  Home Base
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="temple" className="w-4 h-4 text-[#5A1A24]" />
                  Museum (Temple)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="dome" className="w-4 h-4 text-[#5A1A24]" />
                  Church (Dome)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="cypress" className="w-4 h-4 text-[#5A1A24]" />
                  Park (Cypress)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="canvas" className="w-4 h-4 text-[#5A1A24]" />
                  Exhibition (Canvas)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="train" className="w-4 h-4 text-[#5A1A24]" />
                  Station (Train)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <QuestCategoryIcon type="obelisk" className="w-4 h-4 text-[#5A1A24]" />
                  Square / Monument (Obelisk)
                </span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="px-6 py-4 bg-[#EFE7D6] border-t border-[#D5C7AD] flex items-center justify-between">
              <div className="text-xs font-mono text-[#6E5A4F]">
                Total Progress: <strong className="text-[#5A1A24] tabular-nums">{visitedIds.length}/39</strong> stamps collected
              </div>
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-lg border border-[#5A1A24]/40 hover:bg-[#5A1A24]/10 text-[#5A1A24] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Return to Active Map
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
