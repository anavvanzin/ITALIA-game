import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Award,
  MapPin,
  RotateCcw,
  Sparkles,
  BookOpen,
  Grid,
  ListChecks,
  Eye,
  EyeOff,
} from 'lucide-react';
import { GRAND_TOUR_BADGES, ITALY_PLACES, QuestPlace, ChapterId } from '../data/italyPlaces';
import { IlluminatedStampPlate, QuestCategoryIcon } from './QuestIcons';

interface PassaportoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visitedIds: string[];
  stampTimestamps: Record<string, string>;
  onSelectPlace: (place: QuestPlace) => void;
  onResetProgress: () => void;
}

export default function PassaportoDrawer({
  isOpen,
  onClose,
  visitedIds,
  stampTimestamps,
  onSelectPlace,
  onResetProgress,
}: PassaportoDrawerProps) {
  const [activeView, setActiveView] = useState<'gallery' | 'ledger'>('gallery');
  const [filterChapter, setFilterChapter] = useState<'all' | ChapterId>('all');
  const [showUnstampedInGallery, setShowUnstampedInGallery] = useState<boolean>(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const firenzePlaces = ITALY_PLACES.filter((p) => p.chapter === 'firenze');
  const romaPlaces = ITALY_PLACES.filter((p) => p.chapter === 'roma');

  const firenzeVisited = firenzePlaces.filter((p) => visitedIds.includes(p.id)).length;
  const romaVisited = romaPlaces.filter((p) => visitedIds.includes(p.id)).length;

  const filteredPlaces = ITALY_PLACES.filter((p) =>
    filterChapter === 'all' ? true : p.chapter === filterChapter
  );

  const stampedPlaces = filteredPlaces.filter((p) => visitedIds.includes(p.id));
  const unstampedPlaces = filteredPlaces.filter((p) => !visitedIds.includes(p.id));

  const galleryPlaces = showUnstampedInGallery ? filteredPlaces : stampedPlaces;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#2C1E18]/55 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl bg-[#F6F1E7] parchment-surface border-l-2 border-[#5A1A24] shadow-2xl flex flex-col text-[#2C1E18]"
          >
            {/* Illuminated Header */}
            <div className="p-4 sm:p-5 bg-[#EFE7D6] border-b border-[#D5C7AD] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#5A1A24] text-[#EBD197] border border-[#C89D54]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A1A24] leading-none">
                      Passaporto del Grand Tour
                    </h2>
                    <p className="text-xs text-[#6E5A4F] mt-1 font-mono tabular-nums">
                      {visitedIds.length} of 39 Ink Impressions Collected · Firenze {firenzeVisited}/12 · Roma {romaVisited}/27
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-[#5A1A24] hover:bg-[#5A1A24]/10 transition-colors cursor-pointer"
                  aria-label="Close Passaporto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View Mode Switcher & Chapter Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {/* Primary View Toggle: Illuminated Stamp Gallery vs. Honors & Ledger */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F6F1E7] border border-[#D5C7AD]">
                  <button
                    onClick={() => setActiveView('gallery')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      activeView === 'gallery'
                        ? 'bg-[#5A1A24] text-[#F6F1E7] shadow-2xs'
                        : 'text-[#6E5A4F] hover:text-[#2C1E18]'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Illuminated Stamp Gallery</span>
                  </button>
                  <button
                    onClick={() => setActiveView('ledger')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      activeView === 'ledger'
                        ? 'bg-[#5A1A24] text-[#F6F1E7] shadow-2xs'
                        : 'text-[#6E5A4F] hover:text-[#2C1E18]'
                    }`}
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Badges &amp; Quest Ledger</span>
                  </button>
                </div>

                {/* Chapter Filter Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F6F1E7] border border-[#D5C7AD]">
                  {(['all', 'firenze', 'roma'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterChapter(tab)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        filterChapter === tab
                          ? 'bg-[#C89D54] text-[#2C1E18] font-semibold'
                          : 'text-[#6E5A4F] hover:text-[#2C1E18]'
                      }`}
                    >
                      {tab === 'all'
                        ? 'All (39)'
                        : tab === 'firenze'
                        ? `Firenze (${firenzeVisited}/12)`
                        : `Roma (${romaVisited}/27)`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
              {/* Chapter Progress Bars (Always visible at top of folio) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBF8F3] p-4 rounded-xl border border-[#D5C7AD]">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-[#5A1A24]">
                      Chapter I · Firenze {firenzeVisited}/{firenzePlaces.length} conquered
                    </span>
                    <span className="tabular-nums text-[#846024]">
                      {Math.round((firenzeVisited / firenzePlaces.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E3D5BC] overflow-hidden">
                    <div
                      className="h-full bg-[#5A1A24] transition-all duration-300"
                      style={{ width: `${(firenzeVisited / firenzePlaces.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-[#5A1A24]">
                      Chapter II · Roma {romaVisited}/{romaPlaces.length} conquered
                    </span>
                    <span className="tabular-nums text-[#846024]">
                      {Math.round((romaVisited / romaPlaces.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E3D5BC] overflow-hidden">
                    <div
                      className="h-full bg-[#C89D54] transition-all duration-300"
                      style={{ width: `${(romaVisited / romaPlaces.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {activeView === 'gallery' ? (
                /* ==============================================================
                   VIEW 1: ILLUMINATED STAMP GALLERY (GRID OF ENGRAVED ILLUSTRATIONS)
                   ============================================================== */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5C7AD] pb-2.5">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#5A1A24]">
                        Folio of Engraved Ink Impressions
                      </h3>
                      <p className="text-xs text-[#6E5A4F]">
                        Click any architectural plate to fly the camera directly to its pin on the map.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowUnstampedInGallery((v) => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5C7AD] bg-[#FBF8F3] hover:bg-[#EFE7D6] text-xs font-medium text-[#5A1A24] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {showUnstampedInGallery ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-[#846024]" />
                          <span>Stamped Only ({stampedPlaces.length})</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#846024]" />
                          <span>Show Unstamped Slots ({filteredPlaces.length})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {galleryPlaces.length === 0 ? (
                    <div className="text-center py-12 px-6 rounded-2xl border-2 border-dashed border-[#B8A483] bg-[#FBF8F3]/70 space-y-2">
                      <p className="font-serif italic text-xl text-[#5A1A24]">
                        No ink impressions collected in this chapter yet.
                      </p>
                      <p className="text-xs text-[#6E5A4F] max-w-sm mx-auto">
                        Select a monument on the map and click “Mark as visited” to press its custom woodcut illustration into your Passaporto, or toggle “Show Unstamped Slots” to preview all 39 engravings.
                      </p>
                      <button
                        onClick={() => setShowUnstampedInGallery(true)}
                        className="mt-2 px-4 py-2 rounded-lg bg-[#5A1A24] text-[#F6F1E7] text-xs font-semibold cursor-pointer"
                      >
                        Preview All 39 Folio Plates
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                      {galleryPlaces.map((place) => {
                        const isVisited = visitedIds.includes(place.id);
                        return (
                          <IlluminatedStampPlate
                            key={place.id}
                            place={place}
                            isVisited={isVisited}
                            stampDate={stampTimestamps[place.id]}
                            onClick={() => {
                              onSelectPlace(place);
                              onClose();
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* ==============================================================
                   VIEW 2: GRAND TOUR HONORS, BADGES & CHRONOLOGICAL QUEST LEDGER
                   ============================================================== */
                <div className="space-y-6">
                  {/* Grand Tour Honors & Badges */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#5A1A24] mb-2.5">
                      Grand Tour Honors &amp; Badges
                    </h3>
                    <div className="space-y-2.5">
                      {GRAND_TOUR_BADGES.map((badge) => {
                        const status = badge.checkUnlocked(visitedIds);
                        return (
                          <div
                            key={badge.id}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                              status.unlocked
                                ? 'bg-[#FBF8F3] border-[#C89D54] shadow-sm'
                                : 'bg-[#EFE7D6]/50 border-[#D5C7AD] opacity-80'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                status.unlocked
                                  ? 'bg-[#C89D54] text-[#2C1E18]'
                                  : 'bg-[#D5C7AD]/60 text-[#6E5A4F]'
                              }`}
                            >
                              {status.unlocked ? (
                                <Sparkles className="w-5 h-5" />
                              ) : (
                                <Award className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-serif font-bold text-base text-[#5A1A24]">
                                  {badge.title}
                                </h4>
                                <span className="text-[11px] font-mono tabular-nums text-[#846024]">
                                  {status.progress}/{status.total}
                                </span>
                              </div>
                              <p className="text-xs text-[#4A372F] mt-0.5 leading-snug">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remaining Unvisited Quests */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#5A1A24] mb-2.5">
                      Remaining Quests ({unstampedPlaces.length})
                    </h3>
                    <div className="space-y-1.5">
                      {unstampedPlaces.map((place) => (
                        <button
                          key={place.id}
                          onClick={() => {
                            onSelectPlace(place);
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-lg bg-[#FBF8F3] hover:bg-[#EFE7D6] border border-[#E3D5BC] flex items-center gap-3 transition-colors cursor-pointer"
                        >
                          <div className="p-1.5 rounded-md bg-[#EFE7D6] text-[#5A1A24] shrink-0">
                            <QuestCategoryIcon type={place.iconType} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#2C1E18] truncate">
                              {place.name}
                            </div>
                            <div className="text-[11px] text-[#6E5A4F] truncate">
                              {place.city} · {place.date}
                            </div>
                          </div>
                          <MapPin className="w-3.5 h-3.5 text-[#846024] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Reset Progress */}
            <div className="p-4 bg-[#EFE7D6] border-t border-[#D5C7AD] flex items-center justify-between">
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6E5A4F] hover:text-[#5A1A24] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Passaporto Stamps</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5A1A24] font-semibold">Clear all stamps?</span>
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-2.5 py-1 rounded bg-[#5A1A24] text-[#F6F1E7] text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 rounded border border-[#5A1A24]/30 text-xs text-[#2C1E18] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#5A1A24] text-[#F6F1E7] text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
