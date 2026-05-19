"use client";

import { useTheme } from "next-themes";

export interface GlobeConfig {
  colors: {
    online: string;
    onlineGpu: string;
    current: string;
    hover: string;
    atmosphere: string;
  };
  pulse: {
    periodSec: number;
    scaleMin: number;
    scaleMax: number;
    opacityMin: number;
    opacityMax: number;
  };
  globe: {
    surface: string;
    emissive: string;
    emissiveIntensity: number;
    ambientIntensity: number;
    initialFacingLng: number;
    initialTiltDeg: number;
  };
  dot: {
    color: string;
    resolution: number;
    margin: number;
  };
}

const PULSE = {
  periodSec: 2.4,
  scaleMin: 0.85,
  scaleMax: 1.35,
  opacityMin: 0.55,
  opacityMax: 1.0
};

export const GLOBE_CONFIG_DARK: GlobeConfig = {
  colors: {
    online: "#2bd79f",
    onlineGpu: "#7af0c8",
    current: "#ffd166",
    hover: "#ffffff",
    atmosphere: "#ff2903"
  },
  pulse: PULSE,
  globe: {
    surface: "#05060b",
    emissive: "#000000",
    emissiveIntensity: 0,
    ambientIntensity: 0.9,
    initialFacingLng: -95,
    initialTiltDeg: 40
  },
  dot: {
    color: "#5a5a66",
    resolution: 3,
    margin: 0.65
  }
};

export const GLOBE_CONFIG_LIGHT: GlobeConfig = {
  colors: {
    online: "#10b981",
    onlineGpu: "#34d399",
    current: "#f59e0b",
    hover: "#0f172a",
    atmosphere: "#ff2903"
  },
  pulse: PULSE,
  globe: {
    surface: "#e2e8f0",
    emissive: "#000000",
    emissiveIntensity: 0,
    ambientIntensity: 1.1,
    initialFacingLng: -95,
    initialTiltDeg: 40
  },
  dot: {
    color: "#475569",
    resolution: 3,
    margin: 0.65
  }
};

export function getGlobeConfig(theme: "light" | "dark" | undefined): GlobeConfig {
  return theme === "light" ? GLOBE_CONFIG_LIGHT : GLOBE_CONFIG_DARK;
}

export function useGlobeConfig(): GlobeConfig {
  const { resolvedTheme } = useTheme();
  return getGlobeConfig(resolvedTheme === "light" ? "light" : "dark");
}
