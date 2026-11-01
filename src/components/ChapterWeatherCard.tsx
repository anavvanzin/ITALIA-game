import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Droplets,
} from 'lucide-react';
import { ChapterId } from '../data/italyPlaces';

interface ForecastDayItem {
  dateLabel: string;
  conditionText: string;
  conditionType: string;
  maxTempC: number | null;
  minTempC: number | null;
  precipProbabilityPercent: number;
}

interface ChapterWeatherData {
  chapter: ChapterId;
  city: string;
  lat: number;
  lng: number;
  updatedAt: string;
  current: {
    temperatureC: number | null;
    feelsLikeC: number | null;
    conditionText: string;
    conditionType: string;
    isDaytime: boolean;
    humidityPercent: number | null;
    windSpeedKmh: number | null;
    windDirection: string | null;
    uvIndex: number | null;
    precipProbabilityPercent: number;
  };
  forecastDays: ForecastDayItem[];
}

export const WeatherConditionIcon: React.FC<{
  type?: string;
  isDaytime?: boolean;
  className?: string;
}> = ({ type = 'CLEAR', isDaytime = true, className = 'w-4 h-4' }) => {
  const upper = type.toUpperCase();
  if (upper.includes('THUNDER') || upper.includes('STORM')) {
    return <CloudLightning className={`${className} text-[#846024]`} />;
  }
  if (upper.includes('SNOW') || upper.includes('ICE') || upper.includes('SLEET')) {
    return <Snowflake className={`${className} text-[#5A1A24]`} />;
  }
  if (upper.includes('RAIN') || upper.includes('SHOWER') || upper.includes('DRIZZLE')) {
    return <CloudRain className={`${className} text-[#5A1A24]`} />;
  }
  if (upper.includes('FOG') || upper.includes('MIST') || upper.includes('HAZE')) {
    return <CloudFog className={`${className} text-[#6E5A4F]`} />;
  }
  if (upper.includes('PARTLY') || upper.includes('MOSTLY_CLEAR') || upper.includes('SCATTERED')) {
    return <CloudSun className={`${className} text-[#846024]`} />;
  }
  if (upper.includes('CLOUD') || upper.includes('OVERCAST')) {
    return <Cloud className={`${className} text-[#6E5A4F]`} />;
  }
  if (!isDaytime) {
    return <Moon className={`${className} text-[#846024]`} />;
  }
  return <Sun className={`${className} text-[#C89D54]`} />;
};

interface ChapterWeatherCardProps {
  selectedChapter: ChapterId;
}

export default function ChapterWeatherCard({ selectedChapter }: ChapterWeatherCardProps) {
  const [weather, setWeather] = useState<ChapterWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  const fetchWeather = useCallback(
    async (forceRefresh: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/weather?chapter=${selectedChapter}${forceRefresh ? '&refresh=1' : ''}`
        );
        const data = await res.json();

        // Tier 2 Quota Defense
        if (res.status === 429 || data?.error === 'RESOURCE_EXHAUSTED') {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          throw new Error('Daily Weather API quota reached');
        }

        if (!res.ok) {
          throw new Error(data?.error || 'Weather unavailable');
        }

        setWeather(data);
      } catch (err: any) {
        setError(err?.message || 'Weather unavailable');
      } finally {
        setLoading(false);
      }
    },
    [selectedChapter]
  );

  useEffect(() => {
    fetchWeather(false);
  }, [fetchWeather]);

  const cityLabel = selectedChapter === 'firenze' ? 'Firenze' : 'Roma';

  return (
    <div className="pointer-events-auto relative">
      {/* Compact Current Conditions Map Badge */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F6F1E7]/95 hover:bg-[#EFE7D6] parchment-surface border border-[#5A1A24] shadow-lg text-xs text-[#2C1E18] transition-colors cursor-pointer whitespace-nowrap"
        title={`View ${cityLabel} current weather & 3-day forecast`}
        aria-expanded={expanded}
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5A1A24]" />
            <span className="font-serif font-bold text-[#5A1A24]">{cityLabel}</span>
            <span className="text-[11px] text-[#6E5A4F]">Weather…</span>
          </>
        ) : error || !weather ? (
          <>
            <Cloud className="w-3.5 h-3.5 text-[#6E5A4F]" />
            <span className="font-serif font-bold text-[#5A1A24]">{cityLabel}</span>
            <span className="text-[11px] text-[#6E5A4F]">Almanac</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#5A1A24]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#5A1A24]" />
            )}
          </>
        ) : (
          <>
            <WeatherConditionIcon
              type={weather.current.conditionType}
              isDaytime={weather.current.isDaytime}
              className="w-4 h-4 shrink-0"
            />
            <span className="font-serif font-bold text-sm text-[#5A1A24]">{weather.city}</span>
            <span aria-hidden="true" className="text-[#B8A483]">
              ·
            </span>
            <span className="font-mono font-bold text-xs text-[#2C1E18] tabular-nums">
              {weather.current.temperatureC !== null ? `${weather.current.temperatureC}°C` : '—°C'}
            </span>
            <span className="hidden md:inline text-[11px] font-serif italic text-[#4A372F] max-w-[110px] truncate">
              {weather.current.conditionText}
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#5A1A24] shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#5A1A24] shrink-0" />
            )}
          </>
        )}
      </button>

      {/* Expanded 3-Day Forecast Outlook Popover */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#F6F1E7] parchment-surface border-2 border-[#5A1A24] shadow-2xl p-4 z-40 text-[#2C1E18]"
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#D5C7AD]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#846024]">
                  Chapter Weather Almanac
                </div>
                <h4 className="font-serif font-bold text-lg text-[#5A1A24] leading-tight">
                  {cityLabel} · Current &amp; 3-Day Outlook
                </h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchWeather(true);
                }}
                disabled={loading}
                className="p-1.5 rounded-lg text-[#5A1A24] hover:bg-[#5A1A24]/10 transition-colors cursor-pointer"
                title="Refresh weather forecast"
                aria-label="Refresh weather forecast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {error || !weather ? (
              <div className="py-4 text-xs text-[#6E5A4F] space-y-2">
                <p>{error || 'Weather data is currently unavailable for this chapter.'}</p>
                <button
                  onClick={() => fetchWeather(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#5A1A24] text-[#F6F1E7] text-xs font-semibold cursor-pointer"
                >
                  Retry Lookup
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {/* Current Conditions Highlight */}
                <div className="flex items-center justify-between bg-[#FBF8F3] p-3 rounded-xl border border-[#D5C7AD]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#EFE7D6] border border-[#C89D54]/50">
                      <WeatherConditionIcon
                        type={weather.current.conditionType}
                        isDaytime={weather.current.isDaytime}
                        className="w-6 h-6"
                      />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base text-[#2C1E18] leading-tight">
                        {weather.current.conditionText}
                      </div>
                      {weather.current.feelsLikeC !== null && (
                        <div className="text-[11px] font-mono text-[#6E5A4F] tabular-nums">
                          Feels like {weather.current.feelsLikeC}°C
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#5A1A24] tabular-nums">
                    {weather.current.temperatureC !== null
                      ? `${weather.current.temperatureC}°C`
                      : '—°C'}
                  </div>
                </div>

                {/* Unboxed Atmospheric Metadata Strip */}
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-[#4A372F] px-0.5">
                  {weather.current.humidityPercent !== null && (
                    <span className="tabular-nums">
                      Humidity: <strong className="font-mono">{weather.current.humidityPercent}%</strong>
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  {weather.current.windSpeedKmh !== null && (
                    <span className="tabular-nums">
                      Wind:{' '}
                      <strong className="font-mono">
                        {weather.current.windSpeedKmh} km/h
                      </strong>
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    Rain: <strong className="font-mono">{weather.current.precipProbabilityPercent}%</strong>
                  </span>
                </div>

                {/* 3-Day Forecast Outlook Table */}
                {weather.forecastDays.length > 0 && (
                  <div className="pt-2 border-t border-[#D5C7AD]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#846024] mb-1.5">
                      3-Day Forecast (°C)
                    </div>
                    <div className="space-y-1.5">
                      {weather.forecastDays.map((day, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-[#EFE7D6]/60 border border-[#E3D5BC] text-xs"
                        >
                          <span className="font-serif font-bold text-[#5A1A24] w-20 truncate">
                            {day.dateLabel}
                          </span>

                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <WeatherConditionIcon
                              type={day.conditionType}
                              isDaytime={true}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-[11px] text-[#4A372F] truncate">
                              {day.conditionText}
                            </span>
                          </div>

                          {day.precipProbabilityPercent > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#6E5A4F] tabular-nums shrink-0">
                              <Droplets className="w-2.5 h-2.5 text-[#846024]" />
                              {day.precipProbabilityPercent}%
                            </span>
                          )}

                          <span className="font-mono text-xs font-semibold text-[#2C1E18] tabular-nums shrink-0">
                            {day.maxTempC !== null ? `${day.maxTempC}°` : '—'} /{' '}
                            <span className="text-[#6E5A4F]">
                              {day.minTempC !== null ? `${day.minTempC}°C` : '—'}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
