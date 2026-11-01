import { DayStage, ITALY_PLACES, QuestPlace } from '../data/italyPlaces';

export interface StageTrailMetrics {
  stageTitle: string;
  stageShortDate: string;
  totalWalkingKm: number;
  formattedDistance: string;
  walkingMinutes: number;
  formattedDuration: string;
  stopCount: number;
  legFromPrevKm: number;
  formattedLegDistance: string;
  legFromPrevMinutes: number;
  formattedLegDuration: string;
  prevStopName: string;
  isStreetSnapped: boolean;
  transitNote?: string;
}

const EARTH_RADIUS_KM = 6371;
// Historic Italian city centers (Florence & Rome) have a ~1.28x street grid detour factor vs straight-line geodesic distance
const URBAN_STREET_DETOUR_FACTOR = 1.28;
// Sightseeing walking pace: 4.5 km/h (13.33 min per km)
const WALKING_SPEED_KMH = 4.5;

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

export function computePolylineLengthKm(
  points: Array<{ lat: number; lng: number }>
): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineDistanceKm(points[i], points[i + 1]);
  }
  return total;
}

export function formatDistanceKm(km: number): string {
  if (km < 0.1) {
    return `${Math.max(10, Math.round(km * 1000))} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDurationMinutes(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

/**
 * Calculates daily walking distance (km) and estimated walking time for an active stage trail,
 * as well as the specific leg leading to `selectedPlace`.
 */
export function calculateStageTrailMetrics(
  activeStage: DayStage,
  stageWaypoints: QuestPlace[],
  selectedPlace: QuestPlace | null,
  snappedPathCoords?: Array<{ lat: number; lng: number }> | null
): StageTrailMetrics {
  let totalWalkingKm = 0;
  let isStreetSnapped = false;
  let transitNote: string | undefined;

  if (activeStage.isTrainTransfer) {
    // Nov 24 Special Transfer Stage:
    // Calculate walking segments in Florence (Gold Artè -> Firenze SMN) and Rome (Termini -> Ruby Giulia -> Santa Maria Maggiore -> Ruby Giulia)
    // excluding the high-speed rail segment between Firenze SMN and Roma Termini
    const florenceGoldArte = ITALY_PLACES.find((p) => p.id === 'florence-gold-arte')!;
    const firenzeStation = ITALY_PLACES.find((p) => p.id === 'florence-stazione-smn')!;
    const romaStation = ITALY_PLACES.find((p) => p.id === 'rome-stazione-termini')!;
    const rubyGiulia = ITALY_PLACES.find((p) => p.id === 'rome-ruby-giulia')!;
    const smMaggiore = ITALY_PLACES.find((p) => p.id === 'rome-santa-maria-maggiore')!;

    const flWalkRaw = haversineDistanceKm(florenceGoldArte, firenzeStation);
    const rmWalkRaw =
      haversineDistanceKm(romaStation, rubyGiulia) +
      haversineDistanceKm(rubyGiulia, smMaggiore) +
      haversineDistanceKm(smMaggiore, rubyGiulia);

    totalWalkingKm = (flWalkRaw + rmWalkRaw) * URBAN_STREET_DETOUR_FACTOR;
    transitNote = 'Excludes high-speed train (Firenze SMN → Roma Termini, ~1 hr 35 min)';
  } else if (snappedPathCoords && snappedPathCoords.length > 2) {
    totalWalkingKm = computePolylineLengthKm(snappedPathCoords);
    isStreetSnapped = true;
  } else {
    // Sum segments along stageWaypoints; if a single leg exceeds 5 km (e.g., Bus 25A from Piazza della Libertà to Pratolino),
    // treat that suburban bus leg separately so the walking commitment stays realistic
    let hasBusTransfer = false;
    for (let i = 0; i < stageWaypoints.length - 1; i++) {
      const segRaw = haversineDistanceKm(stageWaypoints[i], stageWaypoints[i + 1]);
      if (segRaw > 5.0) {
        hasBusTransfer = true;
      } else {
        totalWalkingKm += segRaw * URBAN_STREET_DETOUR_FACTOR;
      }
    }
    if (hasBusTransfer) {
      transitNote = 'Excludes regional Bus 25A ride between Piazza della Libertà & Pratolino';
    }
  }

  const walkingMinutes = (totalWalkingKm / WALKING_SPEED_KMH) * 60;

  // Calculate the specific leg to `selectedPlace` from its predecessor in the stage (or from active Home Base)
  let legFromPrevKm = 0;
  let prevStopName = stageWaypoints[0]?.name.split('(')[0].trim() || 'Home Base';

  if (selectedPlace) {
    // Find first occurrence of selectedPlace in stageWaypoints (preferring index > 0 if it's a stop)
    let idx = stageWaypoints.findIndex((p, i) => i > 0 && p.id === selectedPlace.id);
    if (idx === -1) {
      idx = stageWaypoints.findIndex((p) => p.id === selectedPlace.id);
    }

    if (idx > 0) {
      const prevStop = stageWaypoints[idx - 1];
      prevStopName = prevStop.name.split('(')[0].trim();
      const rawLeg = haversineDistanceKm(prevStop, selectedPlace);
      // If it's the train leg or bus leg, compute distance from the city's Home Base or arrival station
      if (
        prevStop.id === 'florence-stazione-smn' &&
        selectedPlace.id === 'rome-stazione-termini'
      ) {
        legFromPrevKm = rawLeg;
      } else {
        legFromPrevKm = rawLeg * URBAN_STREET_DETOUR_FACTOR;
      }
    } else if (stageWaypoints[0] && selectedPlace.id !== stageWaypoints[0].id) {
      prevStopName = stageWaypoints[0].name.split('(')[0].trim();
      legFromPrevKm =
        haversineDistanceKm(stageWaypoints[0], selectedPlace) * URBAN_STREET_DETOUR_FACTOR;
    }
  }

  const legFromPrevMinutes = (legFromPrevKm / WALKING_SPEED_KMH) * 60;
  const questStopCount = Math.max(0, stageWaypoints.length - 2);

  return {
    stageTitle: activeStage.title,
    stageShortDate: `${activeStage.dayOfWeek} ${activeStage.shortLabel}`,
    totalWalkingKm,
    formattedDistance: formatDistanceKm(totalWalkingKm),
    walkingMinutes,
    formattedDuration: formatDurationMinutes(walkingMinutes),
    stopCount: questStopCount,
    legFromPrevKm,
    formattedLegDistance: formatDistanceKm(legFromPrevKm),
    legFromPrevMinutes,
    formattedLegDuration: formatDurationMinutes(legFromPrevMinutes),
    prevStopName,
    isStreetSnapped,
    transitNote,
  };
}
