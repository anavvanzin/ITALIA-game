import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load env vars
dotenv.config();

function getGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 15-minute cache for Google Maps Platform Weather API responses per chapter
interface CachedWeatherEntry {
  timestamp: number;
  payload: any;
}
const weatherCache = new Map<string, CachedWeatherEntry>();
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000;

const CHAPTER_COORDS: Record<string, { city: string; lat: number; lng: number }> = {
  firenze: {
    city: "Firenze",
    lat: 43.776455,
    lng: 11.260598,
  },
  roma: {
    city: "Roma",
    lat: 41.900429,
    lng: 12.493601,
  },
};

function formatDayLabel(displayDate?: { year?: number; month?: number; day?: number }, idx?: number): string {
  if (idx === 0) return "Today";
  if (idx === 1) return "Tomorrow";
  if (displayDate?.year && displayDate?.month && displayDate?.day) {
    const d = new Date(displayDate.year, displayDate.month - 1, displayDate.day);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  return `Day ${(idx ?? 0) + 1}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/config", (_req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    res.json({ apiKey: apiKey || null });
  });

  app.post("/api/config", (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API Key is required" });
    }

    process.env.GOOGLE_MAPS_API_KEY = apiKey;
    const envPath = path.resolve(process.cwd(), ".env");

    try {
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }

      const keyRegex = /^GOOGLE_MAPS_API_KEY=.*$/m;
      if (keyRegex.test(envContent)) {
        envContent = envContent.replace(keyRegex, `GOOGLE_MAPS_API_KEY="${apiKey}"`);
      } else {
        envContent += `\nGOOGLE_MAPS_API_KEY="${apiKey}"\n`;
      }

      fs.writeFileSync(envPath, envContent);
      weatherCache.clear();
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to write to .env file:", error);
      res.status(500).json({ error: "Failed to save API key" });
    }
  });

  // Google Maps Platform Weather API proxy endpoint (Celsius / METRIC)
  app.get("/api/weather", async (req, res) => {
    try {
      const chapterKey = req.query.chapter === "roma" ? "roma" : "firenze";
      const forceRefresh = req.query.refresh === "1";
      const target = CHAPTER_COORDS[chapterKey];

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "GOOGLE_MAPS_API_KEY is not configured." });
      }

      const now = Date.now();
      const cached = weatherCache.get(chapterKey);
      if (!forceRefresh && cached && now - cached.timestamp < WEATHER_CACHE_TTL_MS) {
        return res.json(cached.payload);
      }

      const currentUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${encodeURIComponent(
        apiKey
      )}&location.latitude=${target.lat}&location.longitude=${target.lng}&unitsSystem=METRIC&languageCode=en`;

      const forecastUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${encodeURIComponent(
        apiKey
      )}&location.latitude=${target.lat}&location.longitude=${target.lng}&days=3&pageSize=3&unitsSystem=METRIC&languageCode=en`;

      const [currentResp, forecastResp] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      const currentJson: any = await currentResp.json().catch(() => ({}));
      const forecastJson: any = await forecastResp.json().catch(() => ({}));

      // Tier 2 Quota Defense Check
      if (
        currentResp.status === 429 ||
        forecastResp.status === 429 ||
        currentJson?.error?.status === "RESOURCE_EXHAUSTED" ||
        forecastJson?.error?.status === "RESOURCE_EXHAUSTED"
      ) {
        return res.status(429).json({
          error: "RESOURCE_EXHAUSTED",
          message: "Google Maps Platform Weather API daily quota reached.",
        });
      }

      if (!currentResp.ok) {
        return res.status(currentResp.status).json({
          error: currentJson?.error?.message || "Unable to fetch current weather conditions.",
        });
      }

      const tempC =
        typeof currentJson?.temperature?.degrees === "number"
          ? Math.round(currentJson.temperature.degrees)
          : null;
      const feelsLikeC =
        typeof currentJson?.feelsLikeTemperature?.degrees === "number"
          ? Math.round(currentJson.feelsLikeTemperature.degrees)
          : tempC;

      const conditionText =
        currentJson?.weatherCondition?.description?.text ||
        currentJson?.weatherCondition?.type ||
        "Clear";
      const conditionType = currentJson?.weatherCondition?.type || "CLEAR";
      const iconBaseUri = currentJson?.weatherCondition?.iconBaseUri || null;

      const humidityPercent =
        typeof currentJson?.relativeHumidity === "number"
          ? currentJson.relativeHumidity
          : null;
      const windSpeedKmh =
        typeof currentJson?.wind?.speed?.value === "number"
          ? Math.round(currentJson.wind.speed.value)
          : null;
      const windDirection = currentJson?.wind?.direction?.cardinal || null;
      const uvIndex =
        typeof currentJson?.uvIndex === "number" ? currentJson.uvIndex : null;
      const precipProbabilityPercent =
        typeof currentJson?.precipitation?.probability?.percent === "number"
          ? currentJson.precipitation.probability.percent
          : 0;

      const rawDays: any[] = Array.isArray(forecastJson?.forecastDays)
        ? forecastJson.forecastDays.slice(0, 3)
        : [];

      const forecastDays = rawDays.map((day, idx) => {
        const dayPart = day?.daytimeForecast || day?.nighttimeForecast || {};
        return {
          dateLabel: formatDayLabel(day?.displayDate, idx),
          conditionText:
            dayPart?.weatherCondition?.description?.text ||
            dayPart?.weatherCondition?.type ||
            "Fair",
          conditionType: dayPart?.weatherCondition?.type || "CLEAR",
          maxTempC:
            typeof day?.maxTemperature?.degrees === "number"
              ? Math.round(day.maxTemperature.degrees)
              : null,
          minTempC:
            typeof day?.minTemperature?.degrees === "number"
              ? Math.round(day.minTemperature.degrees)
              : null,
          precipProbabilityPercent:
            typeof dayPart?.precipitation?.probability?.percent === "number"
              ? dayPart.precipitation.probability.percent
              : 0,
        };
      });

      const payload = {
        chapter: chapterKey,
        city: target.city,
        lat: target.lat,
        lng: target.lng,
        updatedAt: new Date().toISOString(),
        current: {
          temperatureC: tempC,
          feelsLikeC,
          conditionText,
          conditionType,
          iconBaseUri,
          isDaytime: currentJson?.isDaytime !== false,
          humidityPercent,
          windSpeedKmh,
          windDirection,
          uvIndex,
          precipProbabilityPercent,
        },
        forecastDays,
      };

      weatherCache.set(chapterKey, { timestamp: now, payload });
      res.json(payload);
    } catch (error: any) {
      console.error("Weather API error:", error);
      res.status(500).json({
        error: error?.message || "Failed to retrieve weather forecast.",
      });
    }
  });

  // Server-side Gemini Grounding endpoint for Quest Cards (Google Maps Grounding + Google Search Grounding)
  app.post("/api/quest-grounding", async (req, res) => {
    try {
      const { name, city, address, category, date, lat, lng, mode = "both" } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Place name is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured. Please check the Settings > Secrets panel.",
        });
      }

      const ai = getGeminiClient();

      const results: {
        mapsNote?: string;
        searchNote?: string;
        mapsLinks: Array<{ title: string; uri: string }>;
        webLinks: Array<{ title: string; uri: string }>;
      } = {
        mapsLinks: [],
        webLinks: [],
      };

      const tasks: Promise<void>[] = [];

      if (mode === "maps" || mode === "both") {
        tasks.push(
          (async () => {
            const mapsPrompt = `Provide a concise visitor briefing (2-3 sentences max) for "${name}" at ${address}, ${city}, Italy (${category}). Focus on typical opening hours, entrance tips, or what visitors highlight most.`;
            const mapsResp = await ai.models.generateContent({
              model: "gemini-3.8-flash",
              contents: mapsPrompt,
              config: {
                tools: [{ googleMaps: {} }],
                toolConfig:
                  typeof lat === "number" && typeof lng === "number"
                    ? {
                        retrievalConfig: {
                          latLng: {
                            latitude: lat,
                            longitude: lng,
                          },
                        },
                      }
                    : undefined,
              },
            });

            results.mapsNote = mapsResp.text || "";
            const chunks = mapsResp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            for (const chunk of chunks) {
              const c = chunk as any;
              if (c.maps?.uri) {
                results.mapsLinks.push({
                  title: c.maps.title || name,
                  uri: c.maps.uri,
                });
              }
              if (Array.isArray(c.maps?.placeAnswerSources?.reviewSnippets)) {
                for (const snippet of c.maps.placeAnswerSources.reviewSnippets) {
                  if (snippet.googleMapsUri) {
                    results.mapsLinks.push({
                      title: snippet.title || `${name} Review`,
                      uri: snippet.googleMapsUri,
                    });
                  }
                }
              }
            }
          })()
        );
      }

      if (mode === "search" || mode === "both") {
        tasks.push(
          (async () => {
            const searchPrompt = `Provide a brief historical and curatorial note (2-3 sentences max) for "${name}" in ${city}, Italy (planned visit: ${date}). Mention any notable art history detail, exhibition context, or practical booking tip.`;
            const searchResp = await ai.models.generateContent({
              model: "gemini-3.8-flash",
              contents: searchPrompt,
              config: {
                tools: [{ googleSearch: {} }],
              },
            });

            results.searchNote = searchResp.text || "";
            const chunks = searchResp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            for (const chunk of chunks) {
              const c = chunk as any;
              if (c.web?.uri) {
                results.webLinks.push({
                  title: c.web.title || "Web Source",
                  uri: c.web.uri,
                });
              }
            }
          })()
        );
      }

      await Promise.allSettled(tasks);

      const uniqueMaps = Array.from(new Map(results.mapsLinks.map((i) => [i.uri, i])).values());
      const uniqueWeb = Array.from(new Map(results.webLinks.map((i) => [i.uri, i])).values());

      res.json({
        mapsNote: results.mapsNote,
        searchNote: results.searchNote,
        mapsLinks: uniqueMaps,
        webLinks: uniqueWeb,
      });
    } catch (error: any) {
      console.error("Gemini grounding error:", error);
      res.status(500).json({
        error: error?.message || "Unable to fetch Grand Tour Chronicle grounding data.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
