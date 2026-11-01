// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  BookOpen,
  Train,
  RotateCw,
  Award,
  Check,
  Volume2,
  VolumeX,
  Layers,
  Footprints,
} from 'lucide-react';
import {
  ITALY_PLACES,
  DAY_STAGES,
  GRAND_TOUR_BADGES,
  QuestPlace,
  ChapterId,
  DayStage,
} from '../data/italyPlaces';
import { QuestCategoryIcon } from './QuestIcons';
import LevelSelectModal from './LevelSelectModal';
import PassaportoDrawer from './PassaportoDrawer';
import QuestCardModal from './QuestCardModal';
import ChapterWeatherCard from './ChapterWeatherCard';
import { soundFx } from '../utils/sound';
import { calculateStageTrailMetrics } from '../utils/trailMetrics';

interface MapComponentProps {
  apiKey: string;
  onOpenAbout: () => void;
}

const STORAGE_KEY_VISITED = 'grand_tour_ana_visited_v1';
const STORAGE_KEY_TIMESTAMPS = 'grand_tour_ana_stamps_v1';

// Interpolate points along a path for smooth trail-drawing animation
function interpolatePath(
  points: google.maps.LatLngLiteral[],
  stepsPerSegment: number = 28
): google.maps.LatLngLiteral[] {
  if (points.length < 2) return points;
  const dense: google.maps.LatLngLiteral[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      dense.push({
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t,
      });
    }
  }
  dense.push(points[points.length - 1]);
  return dense;
}

/**
 * Animated Trail & Special Nov 24 Train Transfer Controller
 * - Draws dotted burgundy walking trails (#5A1A24) starting and ending at the day's Home Base.
 * - Automatically upgrades walking paths via `Route.computeRoutes()` if a standard API Key with Routes API is available;
 *   seamlessly falls back to interpolated polylines on the Maps Demo Key.
 * - On Nov 24 (`isTrainTransfer`), animates a dashed line from Firenze SMN to Roma Termini with a travelling train icon.
 */
const StageTrailRenderer: React.FC<{
  activeStage: DayStage | null;
  stageWaypoints: QuestPlace[];
  replayNonce: number;
  fitBoundsNonce: number;
  selectedChapter: ChapterId;
  viewAllChapter: boolean;
  onSnappedPathChange: (coords: google.maps.LatLngLiteral[] | null) => void;
}> = ({
  activeStage,
  stageWaypoints,
  replayNonce,
  fitBoundsNonce,
  selectedChapter,
  viewAllChapter,
  onSnappedPathChange,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [trainPos, setTrainPos] = useState<google.maps.LatLngLiteral | null>(null);
  const routesUnsupportedRef = useRef(false);

  // Fit bounds when stage or chapter changes
  useEffect(() => {
    if (!map) return;

    const bounds = new google.maps.LatLngBounds();
    if (viewAllChapter || !activeStage) {
      const chapterPlaces = ITALY_PLACES.filter((p) => p.chapter === selectedChapter);
      chapterPlaces.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    } else {
      stageWaypoints.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        top: 85,
        bottom: 150,
        left: 60,
        right: 60,
      });
    }
  }, [map, activeStage, stageWaypoints, selectedChapter, viewAllChapter, fitBoundsNonce]);

  // Draw and animate the stage trail polyline(s)
  useEffect(() => {
    if (!map || viewAllChapter || !activeStage || stageWaypoints.length < 2) {
      setTrainPos(null);
      onSnappedPathChange(null);
      return;
    }

    let animFrameId: number | null = null;
    let isCancelled = false;
    const polylines: google.maps.Polyline[] = [];

    const firenzeStation = ITALY_PLACES.find((p) => p.id === 'florence-stazione-smn')!;
    const romaStation = ITALY_PLACES.find((p) => p.id === 'rome-stazione-termini')!;

    // Helper to attempt optional Routes API upgrade if standard key is used
    const computeWalkingPath = async (
      pts: google.maps.LatLngLiteral[]
    ): Promise<{ path: google.maps.LatLngLiteral[]; isSnapped: boolean }> => {
      if (pts.length < 2) return { path: pts, isSnapped: false };
      const cacheKey = `gt_route_${pts.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('_')}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return { path: parsed, isSnapped: true };
        } catch {
          // ignore
        }
      }

      if (!routesLib || routesUnsupportedRef.current) {
        return { path: interpolatePath(pts, 28), isSnapped: false };
      }

      try {
        const RouteClass = (routesLib as any).Route;
        if (RouteClass && typeof RouteClass.computeRoutes === 'function') {
          const response = await RouteClass.computeRoutes({
            origin: pts[0],
            destination: pts[pts.length - 1],
            intermediates: pts.slice(1, -1).map((location) => ({ location })),
            travelMode: 'WALKING',
            fields: ['path'],
          });
          const path = response?.routes?.[0]?.path;
          if (Array.isArray(path) && path.length > 1) {
            const normalized = path.map((pt: any) => ({
              lat: typeof pt.lat === 'function' ? pt.lat() : pt.lat,
              lng: typeof pt.lng === 'function' ? pt.lng() : pt.lng,
            }));
            sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
            return { path: normalized, isSnapped: true };
          }
        }
      } catch {
        // Demo key or Routes API not enabled -> use direct interpolated trail without retrying
        routesUnsupportedRef.current = true;
      }

      return { path: interpolatePath(pts, 28), isSnapped: false };
    };

    const runAnimation = async () => {
      if (activeStage.isTrainTransfer) {
        onSnappedPathChange(null);
        // Special Nov 24 stage:
        // 1) Florence walk: Gold Artè -> Firenze SMN
        // 2) High-speed rail: Firenze SMN -> Roma Termini (with animated train icon)
        // 3) Rome walk: Roma Termini -> Ruby Giulia -> Santa Maria Maggiore -> Ruby Giulia
        const florenceGoldArte = ITALY_PLACES.find((p) => p.id === 'florence-gold-arte')!;
        const rubyGiulia = ITALY_PLACES.find((p) => p.id === 'rome-ruby-giulia')!;
        const smMaggiore = ITALY_PLACES.find((p) => p.id === 'rome-santa-maria-maggiore')!;

        const flWalk = interpolatePath(
          [
            { lat: florenceGoldArte.lat, lng: florenceGoldArte.lng },
            { lat: firenzeStation.lat, lng: firenzeStation.lng },
          ],
          15
        );

        // Curved rail trajectory via Arezzo & Orvieto waypoints for authentic rail arc
        const railArc = interpolatePath(
          [
            { lat: firenzeStation.lat, lng: firenzeStation.lng },
            { lat: 43.463, lng: 11.879 }, // Arezzo rail pass
            { lat: 42.718, lng: 12.112 }, // Orvieto rail pass
            { lat: romaStation.lat, lng: romaStation.lng },
          ],
          45
        );

        const romeWalk = interpolatePath(
          [
            { lat: romaStation.lat, lng: romaStation.lng },
            { lat: rubyGiulia.lat, lng: rubyGiulia.lng },
            { lat: smMaggiore.lat, lng: smMaggiore.lng },
            { lat: rubyGiulia.lat, lng: rubyGiulia.lng },
          ],
          20
        );

        // Dotted walking polylines
        const walkSymbol: google.maps.Symbol = {
          path: google.maps.SymbolPath.CIRCLE,
          fillOpacity: 1,
          fillColor: '#5A1A24',
          strokeColor: '#F6F1E7',
          strokeWeight: 1,
          scale: 3,
        };

        // Dashed railway polyline
        const railDashSymbol: google.maps.Symbol = {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          strokeColor: '#5A1A24',
          scale: 3.5,
        };

        const flPoly = new google.maps.Polyline({
          map,
          path: flWalk,
          strokeOpacity: 0,
          icons: [{ icon: walkSymbol, offset: '0', repeat: '12px' }],
          zIndex: 10,
        });

        const railBasePoly = new google.maps.Polyline({
          map,
          path: [],
          strokeColor: '#C89D54',
          strokeOpacity: 0.55,
          strokeWeight: 5,
          zIndex: 11,
        });

        const railPoly = new google.maps.Polyline({
          map,
          path: [],
          strokeOpacity: 0,
          icons: [{ icon: railDashSymbol, offset: '0', repeat: '16px' }],
          zIndex: 12,
        });

        const rmPoly = new google.maps.Polyline({
          map,
          path: [],
          strokeOpacity: 0,
          icons: [{ icon: walkSymbol, offset: '0', repeat: '12px' }],
          zIndex: 10,
        });

        polylines.push(flPoly, railBasePoly, railPoly, rmPoly);

        const totalFrames = 140;
        let frame = 0;

        const animateTrain = () => {
          if (isCancelled) return;
          frame++;
          const progress = Math.min(frame / totalFrames, 1);
          const count = Math.max(2, Math.floor(progress * railArc.length));
          const slice = railArc.slice(0, count);
          railBasePoly.setPath(slice);
          railPoly.setPath(slice);
          setTrainPos(slice[slice.length - 1]);

          if (progress >= 1) {
            rmPoly.setPath(romeWalk);
          } else {
            animFrameId = requestAnimationFrame(animateTrain);
          }
        };

        animFrameId = requestAnimationFrame(animateTrain);
        return;
      }

      // Standard Daily Walking Trail (starts and ends at active Home Base)
      setTrainPos(null);
      const rawCoords = stageWaypoints.map((p) => ({ lat: p.lat, lng: p.lng }));
      const { path: denseCoords, isSnapped } = await computeWalkingPath(rawCoords);
      if (isCancelled) return;

      onSnappedPathChange(isSnapped ? denseCoords : null);

      // Subtle gold glow underlay + dotted burgundy ink trail
      const glowPoly = new google.maps.Polyline({
        map,
        path: [],
        strokeColor: '#C89D54',
        strokeOpacity: 0.4,
        strokeWeight: 6,
        zIndex: 8,
      });

      const dotSymbol: google.maps.Symbol = {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 1,
        fillColor: '#5A1A24',
        strokeColor: '#F6F1E7',
        strokeWeight: 1.2,
        scale: 3.4,
      };

      const trailPoly = new google.maps.Polyline({
        map,
        path: [],
        strokeOpacity: 0,
        icons: [
          {
            icon: dotSymbol,
            offset: '0',
            repeat: '13px',
          },
        ],
        zIndex: 10,
      });

      polylines.push(glowPoly, trailPoly);

      const totalFrames = 75;
      let frame = 0;

      const step = () => {
        if (isCancelled) return;
        frame++;
        const progress = Math.min(frame / totalFrames, 1);
        const count = Math.max(2, Math.floor(progress * denseCoords.length));
        const currentSlice = denseCoords.slice(0, count);
        glowPoly.setPath(currentSlice);
        trailPoly.setPath(currentSlice);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        }
      };

      animFrameId = requestAnimationFrame(step);
    };

    runAnimation();

    return () => {
      isCancelled = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, routesLib, activeStage, stageWaypoints, replayNonce, viewAllChapter, onSnappedPathChange]);

  if (!trainPos || !activeStage?.isTrainTransfer || viewAllChapter) return null;

  return (
    <AdvancedMarker position={trainPos} zIndex={90} title="Grand Tour Express · Firenze → Roma">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#5A1A24] text-[#F6F1E7] border-2 border-[#C89D54] shadow-xl">
        <Train className="w-4 h-4 text-[#EBD197]" />
        <span className="font-mono text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
          Firenze → Roma
        </span>
      </div>
    </AdvancedMarker>
  );
};

export default function MapComponent({ apiKey, onOpenAbout }: MapComponentProps) {
  const [selectedChapter, setSelectedChapter] = useState<ChapterId>('firenze');
  const [activeStageIso, setActiveStageIso] = useState<string>('2026-11-17');
  const [viewAllChapter, setViewAllChapter] = useState<boolean>(false);
  const [includeBackups, setIncludeBackups] = useState<boolean>(false);

  // Level-select screen opens first
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(true);
  const [showPassaporto, setShowPassaporto] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<QuestPlace | null>(null);
  const [snappedPathCoords, setSnappedPathCoords] = useState<google.maps.LatLngLiteral[] | null>(
    null
  );

  // Animation replay nonces
  const [replayNonce, setReplayNonce] = useState<number>(0);
  const [fitBoundsNonce, setFitBoundsNonce] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Newly unlocked badge celebration banner
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);

  // Persistent Passaporto state in localStorage
  const [visitedIds, setVisitedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VISITED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [stampTimestamps, setStampTimestamps] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TIMESTAMPS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VISITED, JSON.stringify(visitedIds));
    } catch {
      // ignore storage errors
    }
  }, [visitedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIMESTAMPS, JSON.stringify(stampTimestamps));
    } catch {
      // ignore
    }
  }, [stampTimestamps]);

  const activeStage = useMemo(
    () => DAY_STAGES.find((s) => s.dateIso === activeStageIso) || DAY_STAGES[0],
    [activeStageIso]
  );

  const activeHomeBase = useMemo(() => {
    const found = ITALY_PLACES.find((p) => p.id === activeStage.homeBaseId);
    return found || ITALY_PLACES[0];
  }, [activeStage]);

  // Compute the ordered places for the active stage:
  // Starts at Home Base -> day's places in date order -> returns to EndHomeBase (or Home Base)
  const stageQuestStops = useMemo(() => {
    return ITALY_PLACES.filter((p) => {
      if (p.isLodging) return false;
      const isPrimary = p.primaryDays.includes(activeStage.dateIso);
      const isBackup = includeBackups && p.backupDays.includes(activeStage.dateIso);
      return isPrimary || isBackup;
    }).sort((a, b) => a.orderIndex - b.orderIndex);
  }, [activeStage, includeBackups]);

  const stageWaypoints = useMemo(() => {
    const startBase = ITALY_PLACES.find((p) => p.id === activeStage.homeBaseId)!;
    const endBase = activeStage.endHomeBaseId
      ? ITALY_PLACES.find((p) => p.id === activeStage.endHomeBaseId)!
      : startBase;

    return [startBase, ...stageQuestStops, endBase];
  }, [activeStage, stageQuestStops]);

  const activeStagePlaceIds = useMemo(() => {
    const ids = new Set<string>();
    stageWaypoints.forEach((p) => ids.add(p.id));
    return ids;
  }, [stageWaypoints]);

  // Calculate active stage trail walking distance (km) & estimated walking time
  const activeStageTrailMetrics = useMemo(() => {
    return calculateStageTrailMetrics(
      activeStage,
      stageWaypoints,
      selectedPlace,
      snappedPathCoords
    );
  }, [activeStage, stageWaypoints, selectedPlace, snappedPathCoords]);

  // If the user selects a marker while viewing "All Chapter" or a marker belonging to another stage,
  // compute the trail metrics for either the active stage (if the place is on it) or that place's primary stage
  const questCardTrailMetrics = useMemo(() => {
    if (!selectedPlace) return null;
    if (!viewAllChapter && activeStagePlaceIds.has(selectedPlace.id)) {
      return activeStageTrailMetrics;
    }
    const targetIso = selectedPlace.primaryDays[0] || activeStage.dateIso;
    const targetStage = DAY_STAGES.find((s) => s.dateIso === targetIso) || activeStage;
    const targetStops = ITALY_PLACES.filter((p) => {
      if (p.isLodging) return false;
      return (
        p.primaryDays.includes(targetStage.dateIso) ||
        (includeBackups && p.backupDays.includes(targetStage.dateIso))
      );
    }).sort((a, b) => a.orderIndex - b.orderIndex);
    const startBase = ITALY_PLACES.find((p) => p.id === targetStage.homeBaseId)!;
    const endBase = targetStage.endHomeBaseId
      ? ITALY_PLACES.find((p) => p.id === targetStage.endHomeBaseId)!
      : startBase;
    const targetWaypoints = [startBase, ...targetStops, endBase];

    return calculateStageTrailMetrics(targetStage, targetWaypoints, selectedPlace, null);
  }, [
    selectedPlace,
    viewAllChapter,
    activeStagePlaceIds,
    activeStageTrailMetrics,
    activeStage,
    includeBackups,
  ]);

  // Chapter progress metrics
  const firenzePlaces = useMemo(() => ITALY_PLACES.filter((p) => p.chapter === 'firenze'), []);
  const romaPlaces = useMemo(() => ITALY_PLACES.filter((p) => p.chapter === 'roma'), []);
  const firenzeConquered = useMemo(
    () => firenzePlaces.filter((p) => visitedIds.includes(p.id)).length,
    [firenzePlaces, visitedIds]
  );
  const romaConquered = useMemo(
    () => romaPlaces.filter((p) => visitedIds.includes(p.id)).length,
    [romaPlaces, visitedIds]
  );

  // Toggle Visited & Check Badge Unlock
  const handleToggleVisited = useCallback(
    (place: QuestPlace) => {
      setVisitedIds((prev) => {
        const alreadyVisited = prev.includes(place.id);
        const next = alreadyVisited ? prev.filter((id) => id !== place.id) : [...prev, place.id];

        if (!alreadyVisited) {
          soundFx.playStamp();
          const nowLabel = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          setStampTimestamps((stamps) => ({ ...stamps, [place.id]: nowLabel.toUpperCase() }));

          // Check if a badge just transitioned from locked -> unlocked
          for (const badge of GRAND_TOUR_BADGES) {
            const wasUnlocked = badge.checkUnlocked(prev).unlocked;
            const nowUnlocked = badge.checkUnlocked(next).unlocked;
            if (!wasUnlocked && nowUnlocked) {
              setUnlockedToast(`Badge Unlocked: ${badge.title} — ${badge.subtitle}`);
              setTimeout(() => setUnlockedToast(null), 4500);
            }
          }
        }
        return next;
      });
    },
    []
  );

  const handleSelectChapter = (chapter: ChapterId, stageIso?: string) => {
    soundFx.playStageSelect();
    setSelectedChapter(chapter);
    if (stageIso) {
      setActiveStageIso(stageIso);
      setViewAllChapter(false);
    } else {
      setActiveStageIso(chapter === 'firenze' ? '2026-11-17' : '2026-11-25');
      setViewAllChapter(false);
    }
    setSelectedPlace(null);
    setShowLevelSelect(false);
    setReplayNonce((n) => n + 1);
    setFitBoundsNonce((n) => n + 1);
  };

  const handleSelectStage = (stage: DayStage) => {
    soundFx.playStageSelect();
    setSelectedChapter(stage.chapter);
    setActiveStageIso(stage.dateIso);
    setViewAllChapter(false);
    setSelectedPlace(null);
    setReplayNonce((n) => n + 1);
    setFitBoundsNonce((n) => n + 1);
  };

  const handleActivatePlaceStage = (dateIso: string) => {
    const stage = DAY_STAGES.find((s) => s.dateIso === dateIso);
    if (!stage) return;
    soundFx.playStageSelect();
    setSelectedChapter(stage.chapter);
    setActiveStageIso(stage.dateIso);
    setViewAllChapter(false);
    setReplayNonce((n) => n + 1);
    setFitBoundsNonce((n) => n + 1);
  };

  // Next Quest Button: Flies to the next unvisited place in chronological order
  const handleFlyToNextQuest = () => {
    soundFx.playStageSelect();
    // Prefer unvisited quests in current chapter first, then all Italy
    const currentChapterUnvisited = ITALY_PLACES.filter(
      (p) => p.chapter === selectedChapter && !visitedIds.includes(p.id) && !p.isLodging
    );
    const anyUnvisited = ITALY_PLACES.filter((p) => !visitedIds.includes(p.id));

    const nextPlace = currentChapterUnvisited[0] || anyUnvisited[0] || ITALY_PLACES[0];
    if (!nextPlace) return;

    setSelectedChapter(nextPlace.chapter);
    if (nextPlace.primaryDays[0]) {
      setActiveStageIso(nextPlace.primaryDays[0]);
      setViewAllChapter(false);
    }
    setSelectedPlace(nextPlace);
    setFitBoundsNonce((n) => n + 1);
  };

  const handleSelectPlaceFromDrawer = (place: QuestPlace) => {
    soundFx.playStageSelect();
    setSelectedChapter(place.chapter);
    if (place.primaryDays[0]) {
      setActiveStageIso(place.primaryDays[0]);
      setViewAllChapter(false);
    }
    setSelectedPlace(place);
    setFitBoundsNonce((n) => n + 1);
  };

  const handleResetProgress = () => {
    setVisitedIds([]);
    setStampTimestamps({});
    localStorage.removeItem(STORAGE_KEY_VISITED);
    localStorage.removeItem(STORAGE_KEY_TIMESTAMPS);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.muted = next;
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#F6F1E7] text-[#2C1E18] flex flex-col select-none">
      {/* Top Cartographic Navigation Bar (Strict 3-Zone Contract) */}
      <header className="relative z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-[#F6F1E7] parchment-surface border-b-2 border-[#5A1A24] shadow-sm">
        {/* Zone 1: Brand Title (Single text element wordmark) */}
        <button
          onClick={() => setShowLevelSelect(true)}
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#5A1A24] whitespace-nowrap shrink-0 cursor-pointer text-left"
        >
          Il Grand Tour di Ana
        </button>

        {/* Zone 2: Concise Single-Line Chapter & Tool Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#4A372F]">
          <button
            onClick={() => handleSelectChapter('firenze', '2026-11-17')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedChapter === 'firenze'
                ? 'text-[#5A1A24] font-semibold underline underline-offset-4'
                : 'hover:text-[#5A1A24]'
            }`}
          >
            Chapter I · Firenze ({firenzeConquered}/12)
          </button>
          <button
            onClick={() => handleSelectChapter('roma', '2026-11-25')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedChapter === 'roma'
                ? 'text-[#5A1A24] font-semibold underline underline-offset-4'
                : 'hover:text-[#5A1A24]'
            }`}
          >
            Chapter II · Roma ({romaConquered}/27)
          </button>
          <button
            onClick={() => handleSelectChapter('roma', '2026-11-24')}
            className="hover:text-[#5A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Nov 24 Express
          </button>
          <button
            onClick={() => setShowLevelSelect(true)}
            className="hover:text-[#5A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            World Map
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:text-[#5A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            API Guide
          </button>
        </nav>

        {/* Zone 3: Primary Action (Passaporto Stamp Book) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPassaporto(true)}
            className="px-3.5 py-2 rounded-lg bg-[#5A1A24] hover:bg-[#46131B] text-[#F6F1E7] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#EBD197]" />
            <span>Passaporto ({visitedIds.length}/39)</span>
          </button>
        </div>
      </header>

      {/* Main Map Area */}
      <div className="flex-1 relative grand-tour-map">
        <APIProvider
          apiKey={apiKey}
          libraries={['marker', 'routes']}
          version="weekly"
        >
          <GoogleMap
            defaultCenter={{ lat: 43.776455, lng: 11.256408 }}
            defaultZoom={14}
            renderingType="VECTOR"
            mapId="DEMO_MAP_ID"
            className="w-full h-full"
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            clickableIcons={false}
            gestureHandling="greedy"
            internalUsageAttributionIds={[
              'gmp_mcp_codeassist_v1_aistudio',
              'ais_demo_api_key_applet_k8m3p9v2q5',
            ]}
          >
            <StageTrailRenderer
              activeStage={activeStage}
              stageWaypoints={stageWaypoints}
              replayNonce={replayNonce}
              fitBoundsNonce={fitBoundsNonce}
              selectedChapter={selectedChapter}
              viewAllChapter={viewAllChapter}
              onSnappedPathChange={setSnappedPathCoords}
            />

            {/* Render All 39 Canonical Quest Markers */}
            {ITALY_PLACES.map((place) => {
              const isVisited = visitedIds.includes(place.id);
              const isSelected = selectedPlace?.id === place.id;
              const isOnActiveStage = viewAllChapter
                ? place.chapter === selectedChapter
                : activeStagePlaceIds.has(place.id);

              // Lodgings ("home bases") are always prominently visible
              const isActiveHomeBase =
                place.id === activeStage.homeBaseId || place.id === activeStage.endHomeBaseId;

              const showApproxBadge =
                place.status === 'approximate' || place.status === 'unverified';

              // Determine visual hierarchy
              let zIndex = 20;
              if (place.isBoss) zIndex = 80;
              else if (isSelected) zIndex = 85;
              else if (place.isLodging) zIndex = 65;
              else if (isOnActiveStage) zIndex = 50;

              return (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  zIndex={zIndex}
                  title={`${place.name} (${place.date})`}
                  onClick={() => {
                    soundFx.playStageSelect();
                    setSelectedPlace(place);
                  }}
                >
                  <div
                    className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-150 ${
                      isSelected
                        ? 'scale-125'
                        : isOnActiveStage || place.isLodging || place.isBoss
                        ? 'scale-100 hover:scale-110'
                        : 'scale-85 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {/* BOSS LEVEL Floating Banner for Galleria Borghese */}
                    {place.isBoss && (
                      <div className="mb-1 px-2.5 py-0.5 rounded-full bg-[#5A1A24] text-[#EBD197] border border-[#C89D54] shadow-md text-[10px] font-serif font-bold tracking-wide whitespace-nowrap flex items-center gap-1">
                        <span>★ Favourite gallery</span>
                      </div>
                    )}

                    {/* Home Base Floating Label when active */}
                    {place.isLodging && isActiveHomeBase && (
                      <div className="mb-1 px-2 py-0.5 rounded bg-[#846024] text-[#F6F1E7] border border-[#F6F1E7] shadow-sm text-[9px] font-mono uppercase tracking-wider whitespace-nowrap">
                        Home Base
                      </div>
                    )}

                    {/* Marker Crest */}
                    <div className="relative flex items-center justify-center">
                      {/* Boss Level Pulse Ring */}
                      {place.isBoss && (
                        <div className="absolute -inset-2.5 rounded-full bg-[#C89D54] animate-boss-aura pointer-events-none" />
                      )}

                      {/* Lodging Home Base Glow Ring */}
                      {place.isLodging && (
                        <div className="absolute -inset-2 rounded-full bg-[#DFB76C] animate-home-glow pointer-events-none" />
                      )}

                      <div
                        className={`relative flex items-center justify-center transition-colors shadow-lg ${
                          place.isBoss
                            ? isVisited
                              ? 'w-12 h-12 rounded-2xl bg-[#8A8178] text-[#F6F1E7] border-2 border-[#C89D54]'
                              : 'w-12 h-12 rounded-2xl bg-[#5A1A24] text-[#EBD197] border-2 border-[#C89D54] ring-2 ring-[#5A1A24]'
                            : place.isLodging
                            ? isVisited
                              ? 'w-10 h-10 rounded-xl bg-[#8A8178] text-[#F6F1E7] border-2 border-[#C89D54]'
                              : 'w-10 h-10 rounded-xl bg-[#846024] text-[#F6F1E7] border-2 border-[#F6F1E7] ring-2 ring-[#C89D54]'
                            : isVisited
                            ? 'w-9 h-9 rounded-full bg-[#8A8178] text-[#E5DEC9] border-2 border-[#C89D54]'
                            : isSelected
                            ? 'w-10 h-10 rounded-full bg-[#5A1A24] text-[#F6F1E7] border-2 border-[#C89D54] ring-4 ring-[#5A1A24]/30'
                            : isOnActiveStage
                            ? 'w-9 h-9 rounded-full bg-[#5A1A24] text-[#F6F1E7] border-2 border-[#F6F1E7]'
                            : 'w-8 h-8 rounded-full bg-[#F6F1E7] text-[#5A1A24] border border-[#5A1A24]'
                        }`}
                      >
                        <QuestCategoryIcon
                          type={place.iconType}
                          className={place.isBoss ? 'w-6 h-6' : 'w-4 h-4'}
                        />

                        {/* Visited Gold Check Badge */}
                        {isVisited && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C89D54] text-[#2C1E18] border border-[#F6F1E7] flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Approximate / Unverified Small Seal Indicator */}
                        {showApproxBadge && !isVisited && (
                          <div
                            className="absolute -bottom-1 -right-1 px-1 rounded bg-[#FBF8F3] border border-[#846024] text-[#846024] text-[8px] font-mono font-bold leading-tight"
                            title="Approximate location"
                          >
                            ≈
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Place Name Label on Hover or Active Stage */}
                    <div
                      className={`mt-1 px-2 py-0.5 rounded bg-[#F6F1E7]/95 border border-[#D5C7AD] text-[#2C1E18] text-[10px] font-serif font-bold shadow-xs max-w-[140px] truncate transition-opacity ${
                        isSelected || place.isBoss || isOnActiveStage
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {place.name.split('(')[0].trim()}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
          </GoogleMap>
        </APIProvider>

        {/* Floating Stage Banner & Controls HUD (Top Left / Right on Map) */}
        <div className="pointer-events-none absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {/* Active Stage Card */}
          <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#F6F1E7]/95 parchment-surface border border-[#5A1A24] shadow-lg max-w-full sm:max-w-lg">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-mono text-[#846024]">
                <span className="uppercase font-semibold">
                  {selectedChapter === 'firenze' ? 'Chapter I · Firenze' : 'Chapter II · Roma'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {viewAllChapter
                    ? 'Full Chapter Map'
                    : `${activeStage.dayOfWeek} ${activeStage.shortLabel}`}
                </span>
                {!viewAllChapter && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#5A1A24] font-semibold tabular-nums">
                      <Footprints className="w-3 h-3 text-[#846024]" />
                      {activeStageTrailMetrics.formattedDistance} (~
                      {activeStageTrailMetrics.formattedDuration})
                    </span>
                  </>
                )}
              </div>
              <div className="font-serif font-bold text-base sm:text-lg text-[#5A1A24] leading-tight truncate">
                {viewAllChapter
                  ? selectedChapter === 'firenze'
                    ? 'All 12 Quests in Firenze & Pratolino'
                    : 'All 27 Quests in Eternal Roma'
                  : activeStage.title}
              </div>
            </div>

            {!viewAllChapter && (
              <button
                onClick={() => {
                  setReplayNonce((n) => n + 1);
                  setFitBoundsNonce((n) => n + 1);
                }}
                className="p-2 rounded-lg bg-[#EFE7D6] hover:bg-[#E3D5BC] text-[#5A1A24] border border-[#D5C7AD] transition-colors cursor-pointer shrink-0"
                title="Replay stage trail animation"
                aria-label="Replay stage trail animation"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Quick Actions: Chapter Weather + Progress + Next Quest Button */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {/* Live Chapter Weather Forecast Card (Firenze / Roma in °C) */}
            <ChapterWeatherCard selectedChapter={selectedChapter} />

            {/* Mobile Chapter Switcher */}
            <div className="flex lg:hidden items-center gap-1 p-1 rounded-xl bg-[#F6F1E7]/95 border border-[#5A1A24] shadow-md">
              <button
                onClick={() => handleSelectChapter('firenze', '2026-11-17')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedChapter === 'firenze'
                    ? 'bg-[#5A1A24] text-[#F6F1E7]'
                    : 'text-[#5A1A24]'
                }`}
              >
                Firenze {firenzeConquered}/12
              </button>
              <button
                onClick={() => handleSelectChapter('roma', '2026-11-25')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  selectedChapter === 'roma'
                    ? 'bg-[#5A1A24] text-[#F6F1E7]'
                    : 'text-[#5A1A24]'
                }`}
              >
                Roma {romaConquered}/27
              </button>
            </div>

            <button
              onClick={handleFlyToNextQuest}
              className="px-3.5 py-2.5 rounded-xl bg-[#5A1A24] hover:bg-[#46131B] text-[#F6F1E7] border border-[#C89D54] shadow-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-4 h-4 text-[#EBD197]" />
              <span>Next quest</span>
            </button>

            <button
              onClick={() => {
                setViewAllChapter((v) => !v);
                setFitBoundsNonce((n) => n + 1);
              }}
              className={`px-3 py-2.5 rounded-xl border shadow-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                viewAllChapter
                  ? 'bg-[#C89D54] text-[#2C1E18] border-[#5A1A24]'
                  : 'bg-[#F6F1E7]/95 text-[#5A1A24] border-[#5A1A24] hover:bg-[#EFE7D6]'
              }`}
              title="Toggle between daily trail and full chapter pins"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">
                {viewAllChapter ? 'Showing All Pins' : 'All Chapter'}
              </span>
            </button>

            <button
              onClick={toggleMute}
              className="p-2.5 rounded-xl bg-[#F6F1E7]/95 hover:bg-[#EFE7D6] text-[#5A1A24] border border-[#5A1A24] shadow-md transition-colors cursor-pointer"
              title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Badge Unlocked Celebration Toast */}
        <AnimatePresence>
          {unlockedToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#5A1A24] text-[#F6F1E7] border-2 border-[#C89D54] shadow-2xl flex items-center gap-3"
            >
              <Award className="w-5 h-5 text-[#EBD197] shrink-0" />
              <span className="font-serif font-bold text-base whitespace-nowrap">
                {unlockedToast}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Card Modal / Overlay */}
        <QuestCardModal
          place={selectedPlace}
          activeHomeBase={activeHomeBase}
          isVisited={selectedPlace ? visitedIds.includes(selectedPlace.id) : false}
          isTrailActive={!viewAllChapter}
          trailMetrics={questCardTrailMetrics}
          isPlaceOnActiveStage={
            selectedPlace ? !viewAllChapter && activeStagePlaceIds.has(selectedPlace.id) : false
          }
          onActivatePlaceStage={handleActivatePlaceStage}
          onToggleVisited={handleToggleVisited}
          onClose={() => setSelectedPlace(null)}
          onFlyToNextQuest={handleFlyToNextQuest}
        />

        {/* Bottom Day Timeline Track (Nov 17 … Dec 2) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#F6F1E7]/95 parchment-surface border-t-2 border-[#5A1A24] px-3 sm:px-6 py-2.5 shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 text-xs text-[#4A372F] overflow-x-auto no-scrollbar">
              <span className="font-serif font-bold text-sm text-[#5A1A24] whitespace-nowrap">
                Grand Tour Stage Track
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-[#6E5A4F] whitespace-nowrap tabular-nums">
                Firenze {firenzeConquered}/12 conquered
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-[#6E5A4F] whitespace-nowrap tabular-nums">
                Roma {romaConquered}/27 conquered
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className="inline-flex items-center gap-1.5 text-xs text-[#4A372F] cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={includeBackups}
                  onChange={(e) => setIncludeBackups(e.target.checked)}
                  className="accent-[#5A1A24] rounded cursor-pointer"
                />
                <span>Include backup/optional stops</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {DAY_STAGES.map((stage) => {
              const isSelected = !viewAllChapter && activeStageIso === stage.dateIso;
              const stageStops = ITALY_PLACES.filter(
                (p) =>
                  !p.isLodging &&
                  (p.primaryDays.includes(stage.dateIso) ||
                    (includeBackups && p.backupDays.includes(stage.dateIso)))
              );
              const allStageVisited =
                stageStops.length > 0 && stageStops.every((p) => visitedIds.includes(p.id));

              return (
                <button
                  key={stage.dateIso}
                  onClick={() => handleSelectStage(stage)}
                  className={`group shrink-0 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#5A1A24] text-[#F6F1E7] border-[#C89D54] shadow-md scale-[1.02]'
                      : stage.isTrainTransfer
                      ? 'bg-[#EFE7D6] text-[#5A1A24] border-[#C89D54] hover:bg-[#E3D5BC]'
                      : 'bg-[#FBF8F3] text-[#2C1E18] border-[#D5C7AD] hover:border-[#5A1A24]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-mono leading-none">
                      <span className={isSelected ? 'text-[#EBD197]' : 'text-[#846024]'}>
                        {stage.dayOfWeek}
                      </span>
                      <span className="font-bold tabular-nums">{stage.shortLabel}</span>
                      {stage.isTrainTransfer && <Train className="w-3 h-3 ml-0.5 text-[#C89D54]" />}
                    </div>
                    <div
                      className={`text-[11px] font-serif font-semibold truncate max-w-[115px] mt-0.5 ${
                        isSelected ? 'text-[#F6F1E7]' : 'text-[#5A1A24]'
                      }`}
                    >
                      {stage.chapter === 'firenze' ? 'Firenze' : 'Roma'} · {stageStops.length}{' '}
                      {stageStops.length === 1 ? 'quest' : 'quests'}
                    </div>
                  </div>

                  {allStageVisited && (
                    <div className="w-4 h-4 rounded-full bg-[#C89D54] text-[#2C1E18] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Illuminated Level-Select Modal */}
      <LevelSelectModal
        isOpen={showLevelSelect}
        onSelectChapter={handleSelectChapter}
        onClose={() => setShowLevelSelect(false)}
        visitedIds={visitedIds}
      />

      {/* Collapsible Passaporto Drawer */}
      <PassaportoDrawer
        isOpen={showPassaporto}
        onClose={() => setShowPassaporto(false)}
        visitedIds={visitedIds}
        stampTimestamps={stampTimestamps}
        onSelectPlace={handleSelectPlaceFromDrawer}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
