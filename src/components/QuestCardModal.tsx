import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Compass,
  BookOpen,
  ShieldAlert,
  Footprints,
  Clock,
  Route as RouteIcon,
} from 'lucide-react';
import { QuestPlace } from '../data/italyPlaces';
import { QuestCategoryIcon, PassportStampEmblem } from './QuestIcons';
import { StageTrailMetrics } from '../utils/trailMetrics';

interface QuestCardModalProps {
  place: QuestPlace | null;
  activeHomeBase: QuestPlace;
  isVisited: boolean;
  isTrailActive: boolean;
  trailMetrics: StageTrailMetrics | null;
  isPlaceOnActiveStage: boolean;
  onActivatePlaceStage: (dateIso: string) => void;
  onToggleVisited: (place: QuestPlace) => void;
  onClose: () => void;
  onFlyToNextQuest: () => void;
}

interface GroundingResponse {
  mapsNote?: string;
  searchNote?: string;
  mapsLinks: Array<{ title: string; uri: string }>;
  webLinks: Array<{ title: string; uri: string }>;
  error?: string;
}

export default function QuestCardModal({
  place,
  activeHomeBase,
  isVisited,
  isTrailActive,
  trailMetrics,
  isPlaceOnActiveStage,
  onActivatePlaceStage,
  onToggleVisited,
  onClose,
  onFlyToNextQuest,
}: QuestCardModalProps) {
  const [justStamped, setJustStamped] = useState(false);
  const [groundingData, setGroundingData] = useState<GroundingResponse | null>(null);
  const [loadingGrounding, setLoadingGrounding] = useState(false);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  useEffect(() => {
    setJustStamped(false);
    setGroundingData(null);
    setGroundingError(null);
    setLoadingGrounding(false);
  }, [place?.id]);

  if (!place) return null;

  const showApproxSeal =
    place.status === 'approximate' ||
    place.status === 'unverified' ||
    Boolean(place.notes && place.notes.toLowerCase().includes('unverified'));

  const handleStampClick = () => {
    if (!isVisited) {
      setJustStamped(true);
    }
    onToggleVisited(place);
  };

  const fetchGroundingInsights = async () => {
    setLoadingGrounding(true);
    setGroundingError(null);
    try {
      const response = await fetch('/api/quest-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: place.name,
          city: place.city,
          address: place.address,
          category: place.category,
          date: place.date,
          lat: place.lat,
          lng: place.lng,
          mode: 'both',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not load grounding chronicle.');
      }
      setGroundingData(data);
    } catch (err: any) {
      setGroundingError(err?.message || 'Unable to consult live Grand Tour Chronicle.');
    } finally {
      setLoadingGrounding(false);
    }
  };

  // Walking Directions URL from active Home Base (or direct destination if viewing the Home Base itself)
  const directionsUrl =
    place.id === activeHomeBase.id
      ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
      : `https://www.google.com/maps/dir/?api=1&origin=${activeHomeBase.lat},${activeHomeBase.lng}&destination=${place.lat},${place.lng}&travelmode=walking`;

  return (
    <AnimatePresence>
      <motion.div
        key={place.id}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed z-30 left-3 right-3 bottom-24 sm:left-6 sm:right-auto sm:top-20 sm:bottom-auto sm:w-[420px] max-h-[72vh] sm:max-h-[calc(100vh-11rem)] flex flex-col rounded-2xl bg-[#F6F1E7] parchment-surface shadow-2xl overflow-hidden text-[#2C1E18] ${
          place.isBoss
            ? 'border-2 border-[#C89D54] ring-4 ring-[#C89D54]/25'
            : 'border-2 border-[#5A1A24]'
        }`}
      >
        {/* Boss Level Banner */}
        {place.isBoss && (
          <div className="bg-gradient-to-r from-[#5A1A24] via-[#73222E] to-[#5A1A24] text-[#F6F1E7] px-4 py-1.5 text-xs font-mono tracking-widest uppercase flex items-center justify-between border-b border-[#C89D54]">
            <span className="flex items-center gap-1.5 font-bold text-[#EBD197]">
              <span>★ Favourite gallery</span>
              <span>·</span>
              <span>BOSS LEVEL</span>
            </span>
            <span className="text-[10px] text-[#F6F1E7]/90">CAPUT MUNDI</span>
          </div>
        )}

        {/* Home Base Banner */}
        {place.isLodging && (
          <div className="bg-[#846024] text-[#F6F1E7] px-4 py-1.5 text-xs font-mono tracking-wider uppercase flex items-center justify-between">
            <span>⚑ Home Base Sanctuary</span>
            <span>Daily Trail Origin &amp; Return</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#EFE7D6]/80 border-b border-[#D5C7AD] relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 border ${
                  place.isBoss
                    ? 'bg-[#5A1A24] text-[#EBD197] border-[#C89D54]'
                    : isVisited
                    ? 'bg-[#D5C7AD] text-[#5A1A24] border-[#846024]'
                    : 'bg-[#5A1A24] text-[#F6F1E7] border-[#5A1A24]'
                }`}
              >
                <QuestCategoryIcon type={place.iconType} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#6E5A4F]">
                  <span className="font-semibold text-[#5A1A24]">{place.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{place.date}</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#5A1A24] leading-snug mt-0.5">
                  {place.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6E5A4F] hover:text-[#2C1E18] hover:bg-[#5A1A24]/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close Quest Card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Address & Coordinates + Approx Location Wax Seal */}
          <div className="mt-3 flex items-start justify-between gap-3 text-xs text-[#4A372F]">
            <div className="space-y-0.5">
              <div>{place.address}</div>
              <div className="font-mono text-[11px] text-[#6E5A4F] tabular-nums">
                {place.lat.toFixed(6)}° N, {place.lng.toFixed(6)}° E
              </div>
            </div>

            {showApproxSeal && (
              <div
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#846024] bg-[#FBF8F3] text-[#846024] text-[11px] font-serif italic shadow-xs"
                title={place.notes || 'Approximate or unverified pin location'}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#846024] shrink-0" />
                <span>approx. location</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar space-y-4 relative">
          {/* Celebratory Ink Stamp Animation Overlay */}
          <AnimatePresence>
            {justStamped && isVisited && (
              <motion.div
                initial={{ scale: 2.1, opacity: 0, rotate: -18 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-center py-1"
              >
                <PassportStampEmblem
                  city={place.city}
                  dateLabel="VISITATO"
                  name={place.name}
                  className="w-28 h-28 shadow-md"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Trail Walking Distance & Time Commitment Panel */}
          {trailMetrics && (
            <div className="p-3.5 rounded-xl bg-[#EFE7D6]/85 border border-[#C89D54] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A1A24]">
                  <Footprints className="w-4 h-4 text-[#846024] shrink-0" />
                  <span>
                    {isTrailActive
                      ? `Daily Trail Commitment · ${trailMetrics.stageShortDate}`
                      : `Stage Trail Preview · ${trailMetrics.stageShortDate}`}
                  </span>
                </div>
                {(!isTrailActive || !isPlaceOnActiveStage) && place.primaryDays[0] && (
                  <button
                    onClick={() => onActivatePlaceStage(place.primaryDays[0])}
                    className="text-[11px] font-semibold text-[#5A1A24] underline hover:text-[#846024] cursor-pointer whitespace-nowrap"
                  >
                    Switch to this stage
                  </button>
                )}
              </div>

              {/* Primary Daily Distance & Duration Metrics */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#D5C7AD]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#6E5A4F] flex items-center gap-1">
                    <RouteIcon className="w-3 h-3 text-[#846024]" />
                    <span>Full Day Trail</span>
                  </div>
                  <div className="mt-0.5 font-mono text-base sm:text-lg font-bold text-[#5A1A24] tabular-nums">
                    {trailMetrics.formattedDistance}
                  </div>
                  <div className="text-[10px] text-[#6E5A4F]">
                    Home Base loop · {trailMetrics.stopCount}{' '}
                    {trailMetrics.stopCount === 1 ? 'quest' : 'quests'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#D5C7AD]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#6E5A4F] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#846024]" />
                    <span>Est. Walking Time</span>
                  </div>
                  <div className="mt-0.5 font-mono text-base sm:text-lg font-bold text-[#5A1A24] tabular-nums">
                    ~{trailMetrics.formattedDuration}
                  </div>
                  <div className="text-[10px] text-[#6E5A4F]">
                    At 4.5 km/h strolling pace
                  </div>
                </div>
              </div>

              {/* Direct Leg to This Quest */}
              {!place.isLodging && trailMetrics.legFromPrevKm > 0 && (
                <div className="pt-2 border-t border-[#D5C7AD] flex items-center justify-between gap-2 text-xs text-[#4A372F]">
                  <span className="truncate">
                    From <strong className="font-semibold text-[#2C1E18]">{trailMetrics.prevStopName}</strong>:
                  </span>
                  <span className="font-mono font-semibold text-[#5A1A24] tabular-nums shrink-0">
                    {trailMetrics.formattedLegDistance} · ~{trailMetrics.formattedLegDuration}
                  </span>
                </div>
              )}

              {trailMetrics.transitNote && (
                <div className="text-[11px] italic font-serif text-[#6E5A4F] pt-1 border-t border-[#D5C7AD]/70">
                  {trailMetrics.transitNote}
                </div>
              )}
            </div>
          )}

          {/* One-Line Mission Box */}
          <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#D5C7AD]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#846024] mb-1">
              Quest Mission
            </div>
            <p className="font-serif text-base sm:text-lg italic text-[#2C1E18] leading-snug">
              “{place.mission}”
            </p>
            {place.notes && (
              <p className="mt-2 pt-2 border-t border-[#E3D5BC] text-xs text-[#6E5A4F]">
                <strong className="font-semibold text-[#4A372F]">Cartographer’s Note:</strong> {place.notes}
              </p>
            )}
          </div>

          {/* Live Historical & Visitor Grounding (Google Maps + Google Search Grounding) */}
          <div className="rounded-xl bg-[#EFE7D6]/60 border border-[#D5C7AD] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A1A24]">
                <BookOpen className="w-4 h-4 text-[#846024]" />
                <span>Live Visitor Hours &amp; Historical Tips</span>
              </div>
              {!groundingData && !loadingGrounding && (
                <button
                  onClick={fetchGroundingInsights}
                  className="px-2.5 py-1 rounded-md bg-[#5A1A24] hover:bg-[#46131B] text-[#F6F1E7] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Consult Chronicle
                </button>
              )}
            </div>

            {loadingGrounding && (
              <div className="flex items-center gap-2 text-xs text-[#6E5A4F] py-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#5A1A24]" />
                <span>Consulting Google Maps &amp; Search archives for {place.name}…</span>
              </div>
            )}

            {groundingError && (
              <div className="mt-2 text-xs text-[#5A1A24] flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{groundingError}</span>
              </div>
            )}

            {groundingData && (
              <div className="mt-2.5 space-y-2.5 text-xs text-[#2C1E18] leading-relaxed">
                {groundingData.mapsNote && (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#846024] mb-0.5">
                      Visitor Briefing (Google Maps Grounding)
                    </div>
                    <p>{groundingData.mapsNote}</p>
                  </div>
                )}

                {groundingData.searchNote && (
                  <div className="pt-2 border-t border-[#D5C7AD]">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#846024] mb-0.5">
                      Historical &amp; Exhibition Context (Google Search Grounding)
                    </div>
                    <p>{groundingData.searchNote}</p>
                  </div>
                )}

                {(groundingData.mapsLinks.length > 0 || groundingData.webLinks.length > 0) && (
                  <div className="pt-2 border-t border-[#D5C7AD] flex flex-wrap gap-2">
                    {groundingData.mapsLinks.map((link, i) => (
                      <a
                        key={`maps-${i}`}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A1A24] underline hover:text-[#846024]"
                      >
                        <span>{link.title} (Maps)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                    {groundingData.webLinks.slice(0, 3).map((link, i) => (
                      <a
                        key={`web-${i}`}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E5A4F] underline hover:text-[#5A1A24]"
                      >
                        <span className="truncate max-w-[160px]">{link.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-[#EFE7D6] border-t border-[#D5C7AD] flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl border border-[#5A1A24] bg-[#FBF8F3] hover:bg-[#F6F1E7] text-[#5A1A24] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Navigation className="w-4 h-4 shrink-0" />
              <span>Directions</span>
            </a>

            <button
              onClick={handleStampClick}
              className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isVisited
                  ? 'bg-[#C89D54] text-[#2C1E18] hover:bg-[#DFB76C]'
                  : 'bg-[#5A1A24] text-[#F6F1E7] hover:bg-[#46131B]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isVisited ? 'Visited · Stamped' : 'Mark as visited'}</span>
            </button>
          </div>

          {isVisited && (
            <button
              onClick={onFlyToNextQuest}
              className="w-full py-2 px-3 rounded-lg bg-[#5A1A24]/10 hover:bg-[#5A1A24]/15 text-[#5A1A24] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Fly to Next Unvisited Quest</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
