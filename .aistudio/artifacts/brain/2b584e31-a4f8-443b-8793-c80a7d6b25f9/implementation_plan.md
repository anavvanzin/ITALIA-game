# Il Grand Tour di Ana — Chapter Weather Forecast Card

An illuminated-parchment weather forecast widget integrated directly onto the Grand Tour map canvas that dynamically displays live **Celsius (°C)** temperature and sky conditions for **Firenze** (`43.776455, 11.260598`) or **Roma** (`41.900429, 12.493601`) based on the currently selected chapter, expanding on click into a **3-day outlook**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and architectural decisions incorporate your confirmed answers from Phase 1 and comply with the Google Maps Platform Demo Key limits:

- **Confirmed Decision 1 — Celsius (`°C`) Metric Standard**: All current temperatures, feels-like readings, and 3-day high/low ranges are queried and rendered exclusively in **Celsius (`°C`)** (`unitsSystem=METRIC`) using tabular monospace numerals (`JetBrains Mono`).
- **Confirmed Decision 2 — Compact Map Badge Expanding to a 3-Day Outlook**: By default, the weather widget renders as a compact, non-intrusive cartographic pill in the top-left HUD cluster (showing the city name, custom weather condition icon, current `°C`, and sky summary) so it respects the 15% mobile sticky surface cap. Clicking the badge smoothly expands a parchment popover with feels-like temperature, humidity, wind speed, precipitation probability, and a **3-Day Forecast Outlook**.
- **Confirmed Decision 3 — Server-Side Weather API Proxy & Quota Caching**: Requests to `https://weather.googleapis.com/v1/currentConditions:lookup` and `https://weather.googleapis.com/v1/forecast/days:lookup` are proxied through the Express server with a 15-minute per-city cache (`Firenze` and `Roma`). This eliminates browser CORS issues (CF1) and preserves the 100 calls/day Maps Demo Key quota when switching back and forth between chapters.

---

## 1. Overview & Core Concept

- **What It Does**: Automatically tracks the active chapter (**Chapter I · Firenze** or **Chapter II · Roma**) and displays real-time meteorological conditions from the Google Maps Platform Weather API right on the map HUD, with one-click expansion into a 3-day daily forecast.
- **Target Audience / Persona**: Ana checking live weather conditions in Florence or Rome while planning or walking her daily stage trail.
- **Key Value**: Pairs daily walking distance and time commitments with live local weather and a 3-day horizon so outdoor stages (like *Parco Mediceo di Pratolino*, *Villa Borghese*, and *Terrazza del Pincio*) can be timed with confidence.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Automatic Chapter Synchronization**:
   - When **Chapter I · Firenze** is active (Stages I–VII), the weather badge queries and displays live weather for Florence (`43.776455° N, 11.260598° E`).
   - When **Chapter II · Roma** is active (Stages VIII–XVI), the weather badge automatically switches to Rome (`41.900429° N, 12.493601° E`).
2. **Compact Badge State (Default)**:
   - Positioned in the top HUD alongside the active stage card.
   - Displays an engraved-style weather icon (Sun, Partly Cloudy, Rain, Mist, Clear Night), the chapter city name (`Firenze` or `Roma`), current temperature in `°C` (e.g., `16°C`), and a subtle chevron affordance.
3. **Expanded 3-Day Outlook Card**:
   - Clicking the compact badge opens an illuminated parchment card (`#F6F1E7` surface, `#5A1A24` burgundy border, `#C89D54` gold accents) displaying:
     - **Current Conditions Header**: Condition description (e.g., *Partly Sunny*), current temperature (`16°C`), and `Feels like 15°C`.
     - **Atmospheric Strip**: Unboxed typographic metadata with `·` separators showing `Humidity: 68% · Wind: 11 km/h · Rain chance: 15%`.
     - **3-Day Outlook List**: Three rows for Today, Tomorrow, and Day 3 showing the day label, daytime condition icon and description, precipitation probability, and `High°C / Low°C` in tabular numerals.

### Visual Identity & Theme

- **Aesthetic Direction**: *Renaissance Barometer & Cartographic Weather Alamanac* — matching the existing ivory parchment (`#F6F1E7`), burgundy ink (`#5A1A24`), and antique gold (`#C89D54`) design language.
- **Typography & Hierarchy**:
  - **City & Condition Title**: `Cormorant Garamond` bold/italic.
  - **Atmospheric Labels**: `Plus Jakarta Sans` clean inline text.
  - **Temperatures & Percentages**: `JetBrains Mono` (`tabular-nums`) for crisp vertical alignment across the 3-day table.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Server-Side Proxy with 15-Minute Cache**:
  - *Chosen Approach*: Add a server endpoint that calls Google Maps Platform Weather API `currentConditions:lookup` and `forecast/days:lookup` (`days=3`, `unitsSystem=METRIC`) in parallel and caches the combined result per city for 15 minutes.
  - *Why*: Protects the 100 calls/day Maps Demo Key limit so toggling between Florence and Rome stages never exhausts quota, while still surfacing `429 RESOURCE_EXHAUSTED` to the global Tier 2 quota defense banner if exceeded.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MapComponent (Active Chapter State)                  │
│          selectedChapter: 'firenze' (43.7765, 11.2606)                  │
│                        or 'roma'    (41.9004, 12.4936)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   ChapterWeatherCard (Map HUD Overlay)                  │
│  • Compact Pill: [Weather Icon] Firenze · 16°C · Partly Sunny [▾]       │
│  • Expanded Popover:                                                    │
│    - Current Temp (°C), Feels Like (°C), Humidity %, Wind km/h          │
│    - 3-Day Outlook Table (Day, Condition, Rain %, High°C / Low°C)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ GET /api/weather?chapter=firenze|roma
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Express Server (`server.ts`)                     │
│  • 15-Minute In-Memory City Weather Cache                               │
│  • Parallel Google Maps Platform Weather API Calls (`unitsSystem=METRIC`)│
│    1. GET https://weather.googleapis.com/v1/currentConditions:lookup    │
│    2. GET https://weather.googleapis.com/v1/forecast/days:lookup?days=3 │
│  • Tier 2 Quota Detection (HTTP 429 / RESOURCE_EXHAUSTED propagation)   │
└─────────────────────────────────────────────────────────────────────────┘
```
