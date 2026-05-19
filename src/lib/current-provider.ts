import type { ProviderMarker } from "@/lib/types";

const IP_TIMEOUT_MS = 4000;

export interface CurrentProvider {
  marker: ProviderMarker;
  source: "env" | "ip-geo";
  publicIp?: string;
}

export interface DetectDeps {
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

/**
 * Best-effort detection of the Akash provider hosting this container.
 *
 * Strategy:
 *   1. Honour `AKASH_PROVIDER_ADDRESS` if set (operator can pin it explicitly via SDL env).
 *   2. Otherwise, look up the server's public IP and find the geographically closest provider.
 *
 * Returns null on any failure — the page renders fine without a "you are here" marker.
 */
export async function detectCurrentProvider(providers: ProviderMarker[], deps: DetectDeps = {}): Promise<CurrentProvider | null> {
  if (providers.length === 0) return null;

  const env = deps.env ?? process.env;
  const fetchImpl = deps.fetchImpl ?? fetch;

  const pinnedAddress = env.AKASH_PROVIDER_ADDRESS?.trim();
  if (pinnedAddress) {
    const match = providers.find(p => p.owner === pinnedAddress);
    if (match) return { marker: match, source: "env" };
  }

  try {
    const ipInfo = await fetchServerLocation(fetchImpl);
    if (!ipInfo) return null;
    const closest = findClosest(providers, ipInfo.lat, ipInfo.lng);
    if (!closest) return null;
    return { marker: closest, source: "ip-geo", publicIp: ipInfo.ip };
  } catch {
    return null;
  }
}

interface ServerLocation {
  ip: string;
  lat: number;
  lng: number;
}

async function fetchServerLocation(fetchImpl: typeof fetch): Promise<ServerLocation | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IP_TIMEOUT_MS);
  try {
    const res = await fetchImpl("https://ipapi.co/json/", {
      signal: controller.signal,
      headers: { accept: "application/json" }
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string; latitude?: number; longitude?: number };
    if (typeof data.latitude !== "number" || typeof data.longitude !== "number" || !data.ip) return null;
    return { ip: data.ip, lat: data.latitude, lng: data.longitude };
  } finally {
    clearTimeout(timeout);
  }
}

export function findClosest(providers: ProviderMarker[], lat: number, lng: number): ProviderMarker | null {
  if (providers.length === 0) return null;
  let best: ProviderMarker | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const p of providers) {
    const distance = haversineKm(lat, lng, p.lat, p.lng);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = p;
    }
  }
  return best;
}

/** Great-circle distance in kilometres. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
