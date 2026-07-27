"use client";

import "d3-transition"; // Extends d3-selection with .transition() required by d3-zoom in react19-simple-maps
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  useZoomPanContext,
} from "@vnedyalk0v/react19-simple-maps";
import { useTheme } from "@/components/providers/ThemeProvider";
import { MapSkeleton } from "@/components/ui/Skeleton";
import { ALL_COUNTRIES } from "@/lib/constants/countries";
import { useAttackOrigins } from "@/lib/api/hooks/useLogs";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MAP_WIDTH = 800;
const MAP_HEIGHT = 400;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
// Matches projectionConfig.center so "reset" returns to the exact initial view
const HOME_CENTER: [number, number] = [0, 20];
const ZOOM_STEP = 1.6;

type Severity = "high" | "medium" | "low";

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#eab308",
};

const SEVERITY_RANK: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

const COUNTRY_CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  ALL_COUNTRIES.map((c) => [c.name.toLowerCase(), c.code])
);

export interface AttackLocation {
  id: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  severity: Severity;
  isActive?: boolean;
}

// One map marker per country: several origin IPs from the same place would
// otherwise stack into an unreadable blob
interface OriginGroup {
  id: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  ipCount: number;
  severity: Severity;
  // Precomputed so the memoized <Marker> keeps a stable coordinates reference
  coords: [number, number];
}

// Country coordinates lookup for convenience
export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> =
  {
    "United States": { lat: 39.8283, lng: -98.5795 },
    China: { lat: 35.8617, lng: 104.1954 },
    Russia: { lat: 61.524, lng: 105.3188 },
    Germany: { lat: 51.1657, lng: 10.4515 },
    "United Kingdom": { lat: 55.3781, lng: -3.436 },
    France: { lat: 46.2276, lng: 2.2137 },
    Japan: { lat: 36.2048, lng: 138.2529 },
    Brazil: { lat: -14.235, lng: -51.9253 },
    India: { lat: 20.5937, lng: 78.9629 },
    "South Korea": { lat: 35.9078, lng: 127.7669 },
    Australia: { lat: -25.2744, lng: 133.7751 },
    Canada: { lat: 56.1304, lng: -106.3468 },
    Mexico: { lat: 23.6345, lng: -102.5528 },
    Argentina: { lat: -38.4161, lng: -63.6167 },
    "South Africa": { lat: -30.5595, lng: 22.9375 },
    Nigeria: { lat: 9.082, lng: 8.6753 },
    Egypt: { lat: 26.8206, lng: 30.8025 },
    Iran: { lat: 32.4279, lng: 53.688 },
    Turkey: { lat: 38.9637, lng: 35.2433 },
    Italy: { lat: 41.8719, lng: 12.5674 },
    Spain: { lat: 40.4637, lng: -3.7492 },
    Poland: { lat: 51.9194, lng: 19.1451 },
    Ukraine: { lat: 48.3794, lng: 31.1656 },
    Netherlands: { lat: 52.1326, lng: 5.2913 },
    Vietnam: { lat: 14.0583, lng: 108.2772 },
    Thailand: { lat: 15.87, lng: 100.9925 },
    Indonesia: { lat: -0.7893, lng: 113.9213 },
    Philippines: { lat: 12.8797, lng: 121.774 },
    Malaysia: { lat: 4.2105, lng: 101.9758 },
    Singapore: { lat: 1.3521, lng: 103.8198 },
    "North Korea": { lat: 40.3399, lng: 127.5101 },
    Colombia: { lat: 4.5709, lng: -74.2973 },
    Ethiopia: { lat: 9.145, lng: 38.7667 },
  };

interface AttackMapProps {
  hostId?: string;
  /** Kept for call-site compatibility; origins always come from the API. */
  simulateNewAttacks?: boolean;
}

interface MarkerLayerProps {
  origins: OriginGroup[];
  maxCount: number;
  hoveredId: string | null;
  selectedId: string | null;
  pulseId: string | null;
  onHover: (origin: OriginGroup, clientX: number, clientY: number) => void;
  onLeave: () => void;
  onSelect: (origin: OriginGroup) => void;
}

/**
 * Markers live inside ZoomableGroup, so the parent <g> already scales them by
 * the zoom factor `k`. Dividing every radius by `k` keeps each marker the same
 * size on screen at any zoom level — the dot marks a point, it is not a region.
 */
function MarkerLayer({
  origins,
  maxCount,
  hoveredId,
  selectedId,
  pulseId,
  onHover,
  onLeave,
  onSelect,
}: MarkerLayerProps) {
  const { k } = useZoomPanContext();
  const s = 1 / Math.max(k, 0.001);

  return (
    <g>
      {origins.map((origin) => {
        // sqrt keeps a 60-hit country from dwarfing a 2-hit one
        const base = 3 + Math.sqrt(origin.count / maxCount) * 4.5;
        const color = SEVERITY_COLOR[origin.severity];
        const isHovered = hoveredId === origin.id;
        const isSelected = selectedId === origin.id;
        const isEmphasized = isHovered || isSelected;
        const r = (isEmphasized ? base * 1.25 : base) * s;

        return (
          <Marker
            key={origin.id}
            coordinates={origin.coords}
            onMouseEnter={(e) => onHover(origin, e.clientX, e.clientY)}
            onMouseMove={(e) => onHover(origin, e.clientX, e.clientY)}
            onMouseLeave={onLeave}
            onClick={() => onSelect(origin)}
            className="cursor-pointer"
          >
            {/* Radar sweep on the single hottest origin only */}
            {pulseId === origin.id && (
              <circle
                r={r * 2.4}
                fill="none"
                stroke={color}
                strokeWidth={1.5 * s}
                opacity={0.6}
                className="animate-ping"
                style={{ transformOrigin: "center" }}
              />
            )}

            {/* Soft halo keeps the dot legible over dark landmasses */}
            <circle r={r * 1.9} fill={color} opacity={isEmphasized ? 0.28 : 0.16} />

            {/* Core */}
            <circle
              r={r}
              fill={color}
              opacity={0.95}
              stroke="#ffffff"
              strokeWidth={(isEmphasized ? 1.4 : 0.8) * s}
              strokeOpacity={isEmphasized ? 0.9 : 0.45}
            />

            {/* Selection ring */}
            {isSelected && (
              <circle
                r={r * 2.6}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.2 * s}
                strokeDasharray={`${3 * s} ${3 * s}`}
                opacity={0.8}
              />
            )}
          </Marker>
        );
      })}
    </g>
  );
}

export function AttackMap({ hostId = "all" }: AttackMapProps) {
  const { theme } = useTheme();
  const [geoData, setGeoData] = useState<object | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<{ center: [number, number]; zoom: number }>({
    center: HOME_CENTER,
    zoom: 1,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  // Load world geography client-side so the map always has data (avoids library URL fetch issues)
  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch((err) => {
        if (!cancelled) setGeoError(err?.message ?? "Failed to load map");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch attack origins from API
  const { data: attackOriginsResponse, isLoading } = useAttackOrigins({
    host: hostId !== "all" && hostId !== "Overview" ? hostId : undefined,
    limit: 50,
  });

  // Collapse origin IPs into one entry per country, ordered by volume
  const origins = useMemo<OriginGroup[]>(() => {
    const raw = attackOriginsResponse?.origins ?? [];
    const byCountry = new Map<string, OriginGroup>();

    raw.forEach((origin) => {
      const country = origin.country || "Unknown";
      const key = `${country}-${origin.lat.toFixed(1)}-${origin.lng.toFixed(1)}`;
      const existing = byCountry.get(key);

      if (existing) {
        existing.count += origin.count;
        existing.ipCount += 1;
        if (SEVERITY_RANK[origin.severity] > SEVERITY_RANK[existing.severity]) {
          existing.severity = origin.severity;
        }
        return;
      }

      byCountry.set(key, {
        id: key,
        country,
        lat: origin.lat,
        lng: origin.lng,
        count: origin.count,
        ipCount: 1,
        severity: origin.severity,
        coords: [origin.lng, origin.lat],
      });
    });

    return [...byCountry.values()].sort((a, b) => b.count - a.count);
  }, [attackOriginsResponse]);

  const maxCount = useMemo(
    () => Math.max(...origins.map((o) => o.count), 1),
    [origins]
  );

  const totals = useMemo(() => {
    const sum = (severity: Severity) =>
      origins
        .filter((o) => o.severity === severity)
        .reduce((acc, o) => acc + o.count, 0);
    return { high: sum("high"), medium: sum("medium"), low: sum("low") };
  }, [origins]);

  const hoveredOrigin = useMemo(
    () => origins.find((o) => o.id === hoveredId) ?? null,
    [origins, hoveredId]
  );

  // Only the busiest origin pulses, so the eye has one thing to follow
  const pulseId = origins.length ? origins[0].id : null;

  const handleHover = useCallback(
    (origin: OriginGroup, clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      setHoveredId(origin.id);
      if (rect) setTooltip({ x: clientX - rect.left, y: clientY - rect.top });
    },
    []
  );

  const handleLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  const zoomBy = useCallback((factor: number) => {
    setView((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor)),
    }));
  }, []);

  const resetView = useCallback(() => {
    setSelectedId(null);
    setView({ center: HOME_CENTER, zoom: 1 });
  }, []);

  const focusOrigin = useCallback((origin: OriginGroup) => {
    setSelectedId((prev) => (prev === origin.id ? null : origin.id));
    setView((prev) =>
      prev.center[0] === origin.lng && prev.center[1] === origin.lat
        ? { center: HOME_CENTER, zoom: 1 }
        : { center: origin.coords, zoom: 4 }
    );
  }, []);

  const isDark = theme === "dark";

  // Show skeleton while attack data or geography is loading
  if (isLoading) {
    return <MapSkeleton />;
  }

  if (geoError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attack Origins
          </h3>
        </div>
        <div className="relative w-full min-h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Map unavailable: {geoError}
          </p>
        </div>
      </div>
    );
  }

  if (!geoData) {
    return <MapSkeleton />;
  }

  return (
    <div>
      {/* Header with title and stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Attack Origins
          </h3>
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              LIVE
            </span>
          </div>
        </div>

        {/* Severity stats inline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6">
          {(["high", "medium", "low"] as const).map((severity) => (
            <div key={severity} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: SEVERITY_COLOR[severity] }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: SEVERITY_COLOR[severity] }}
              >
                {totals[severity]}
              </span>
              <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Map */}
        <div
          ref={containerRef}
          className="relative flex-1 min-w-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800"
        >
          <ComposableMap
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 147,
              center: HOME_CENTER,
            }}
            style={{ width: "100%", height: "auto", maxHeight: "24rem" }}
          >
            <ZoomableGroup
              center={view.center}
              zoom={view.zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              onMoveEnd={(position) =>
                setView({ center: position.coordinates, zoom: position.zoom })
              }
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo, idx) => (
                    <Geography
                      key={(geo as { rsmKey?: string }).rsmKey ?? `geo-${idx}`}
                      geography={geo}
                      fill={isDark ? "#1f2937" : "#e5e7eb"}
                      stroke={isDark ? "#374151" : "#d1d5db"}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: isDark ? "#374151" : "#d1d5db",
                          outline: "none",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              <MarkerLayer
                origins={origins}
                maxCount={maxCount}
                hoveredId={hoveredId}
                selectedId={selectedId}
                pulseId={pulseId}
                onHover={handleHover}
                onLeave={handleLeave}
                onSelect={focusOrigin}
              />
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom controls */}
          <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
            <button
              type="button"
              onClick={() => zoomBy(ZOOM_STEP)}
              disabled={view.zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => zoomBy(1 / ZOOM_STEP)}
              disabled={view.zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="p-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset view"
              className="p-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>

          {/* Hint */}
          <div className="absolute bottom-3 left-3 text-[10px] text-gray-500 dark:text-gray-500 pointer-events-none select-none">
            Scroll to zoom · drag to pan
          </div>

          {/* Hover tooltip */}
          {hoveredOrigin && tooltip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-3 py-2 shadow-lg backdrop-blur-sm"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLOR[hoveredOrigin.severity] }}
                />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {hoveredOrigin.country}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                {hoveredOrigin.count.toLocaleString()} attacks ·{" "}
                {hoveredOrigin.ipCount} {hoveredOrigin.ipCount === 1 ? "IP" : "IPs"} ·{" "}
                <span className="capitalize">{hoveredOrigin.severity}</span>
              </div>
            </div>
          )}

          {origins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-lg bg-white/80 dark:bg-gray-900/80 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                No attack origins recorded
              </p>
            </div>
          )}
        </div>

        {/* Ranked origins — readable regardless of how crowded the map gets */}
        <aside className="lg:w-64 xl:w-72 shrink-0">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Top origins
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {origins.length} {origins.length === 1 ? "location" : "locations"}
            </span>
          </div>

          <ul className="max-h-96 space-y-1 overflow-y-auto pr-1">
            {origins.slice(0, 8).map((origin, index) => {
              const code = COUNTRY_CODE_BY_NAME[origin.country.toLowerCase()];
              const isActive = selectedId === origin.id || hoveredId === origin.id;

              return (
                <li key={origin.id}>
                  <button
                    type="button"
                    onClick={() => focusOrigin(origin)}
                    onMouseEnter={() => setHoveredId(origin.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
                      isActive
                        ? "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                        : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
                        {index + 1}
                      </span>
                      {code ? (
                        <ReactCountryFlag
                          countryCode={code}
                          svg
                          style={{ width: "14px", height: "14px", borderRadius: "2px" }}
                          title={origin.country}
                        />
                      ) : (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLOR[origin.severity] }}
                        />
                      )}
                      <span className="flex-1 truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                        {origin.country}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-white">
                        {origin.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700/60">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, (origin.count / maxCount) * 100)}%`,
                          backgroundColor: SEVERITY_COLOR[origin.severity],
                        }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}

            {origins.length === 0 && (
              <li className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-3 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                Nothing to show yet
              </li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}

// Helper function to add an attack by country name
export function createAttackFromCountry(
  country: string,
  count: number,
  severity: Severity
): AttackLocation | null {
  const coords = COUNTRY_COORDINATES[country];
  if (!coords) return null;

  return {
    id: `attack-${Date.now()}`,
    country,
    lat: coords.lat,
    lng: coords.lng,
    count,
    severity,
    isActive: true,
  };
}

// Helper function to add an attack by coordinates
export function createAttackFromCoordinates(
  lat: number,
  lng: number,
  count: number,
  severity: Severity,
  countryName = "Unknown"
): AttackLocation {
  return {
    id: `attack-${Date.now()}`,
    country: countryName,
    lat,
    lng,
    count,
    severity,
    isActive: true,
  };
}
