"use client";

import "d3-transition"; // Extends d3-selection with .transition() required by d3-zoom in react19-simple-maps
import { useState, useMemo, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "@vnedyalk0v/react19-simple-maps";
import { useTheme } from "@/components/providers/ThemeProvider";
import { MapSkeleton } from "@/components/ui/Skeleton";
import { useAttackOrigins } from "@/lib/api/hooks/useLogs";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface AttackLocation {
  id: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  severity: "high" | "medium" | "low";
  isActive?: boolean;
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
  simulateNewAttacks?: boolean;
}

export function AttackMap({
  hostId = "all",
  simulateNewAttacks = true,
}: AttackMapProps) {
  const { theme } = useTheme();
  const [geoData, setGeoData] = useState<object | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

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
  const { data: attackOriginsResponse, isLoading, error } = useAttackOrigins({
    host: hostId !== "all" && hostId !== "Overview" ? hostId : undefined,
    limit: 50,
  });

  // Transform API response to AttackLocation format
  const attacks = useMemo(() => {
    if (!attackOriginsResponse?.origins) return [];
    return attackOriginsResponse.origins.map((origin, idx) => ({
      id: `${origin.ip}-${idx}`,
      country: origin.country,
      lat: origin.lat,
      lng: origin.lng,
      count: origin.count,
      severity: origin.severity,
      isActive: idx < 2,
    }));
  }, [attackOriginsResponse]);

  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());

  const maxCount = useMemo(
    () => Math.max(...attacks.map((a) => a.count), 1),
    [attacks]
  );

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f97316";
      case "low":
        return "#eab308";
    }
  };

  const isDark = theme === "dark";

  // Sum up the attack counts by severity, not just count the number of origins
  const highCount = attacks
    .filter((a) => a.severity === "high")
    .reduce((sum, a) => sum + a.count, 0);
  const mediumCount = attacks
    .filter((a) => a.severity === "medium")
    .reduce((sum, a) => sum + a.count, 0);
  const lowCount = attacks
    .filter((a) => a.severity === "low")
    .reduce((sum, a) => sum + a.count, 0);

  // Show skeleton while attack data or geography is loading
  if (isLoading) {
    return <MapSkeleton />;
  }

  // Show skeleton while geography is loading; show message if it failed
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-sm font-semibold text-red-500">
              {highCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              High
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-sm font-semibold text-orange-500">
              {mediumCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Medium
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-semibold text-yellow-500">
              {lowCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Low
            </span>
          </div>
        </div>
      </div>

      {/* Map container - explicit size so SVG renders correctly */}
      <div className="relative w-full min-h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800/50">
        <ComposableMap
          width={800}
          height={400}
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 147,
            center: [0, 20],
          }}
          style={{ width: "100%", height: "auto", maxHeight: "24rem" }}
        >
          <ZoomableGroup>
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

            {attacks.map((attack) => {
              const size = 6 + (attack.count / maxCount) * 12;
              const color = getSeverityColor(attack.severity);
              const isPulsing = pulsingIds.has(attack.id) || attack.isActive;

              return (
                <Marker key={attack.id} coordinates={[attack.lng, attack.lat]}>
                  {/* Outer pulsing ring */}
                  {isPulsing && (
                    <circle
                      r={size * 2}
                      fill={color}
                      opacity={0.2}
                      className="animate-ping"
                      style={{ transformOrigin: "center" }}
                    />
                  )}

                  {/* Middle glow ring */}
                  <circle
                    r={size * 1.5}
                    fill={color}
                    opacity={0.3}
                    className={isPulsing ? "animate-pulse" : ""}
                  />

                  {/* Inner solid circle */}
                  <circle
                    r={size}
                    fill={color}
                    opacity={0.8}
                    stroke={color}
                    strokeWidth={1}
                  />

                  {/* Center bright dot */}
                  <circle r={size * 0.4} fill="#ffffff" opacity={0.9} />

                  <title>{`${attack.count} attacks from ${attack.country}`}</title>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}

// Helper function to add an attack by country name
export function createAttackFromCountry(
  country: string,
  count: number,
  severity: "high" | "medium" | "low"
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
  severity: "high" | "medium" | "low",
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
