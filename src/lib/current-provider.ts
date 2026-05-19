import { lookup as dnsLookup } from "node:dns/promises";

import type { ProviderMarker } from "@/lib/types";

const IP_TIMEOUT_MS = 4000;
const DNS_TIMEOUT_MS = 2000;

export interface CurrentProvider {
  marker: ProviderMarker;
  source: "ip-host" | "ip-geo";
  publicIp?: string;
}

export type DnsLookupFn = (hostname: string) => Promise<{ address: string; family: number }>;

export interface DetectDeps {
  fetchImpl?: typeof fetch;
  dnsLookup?: DnsLookupFn;
}

/**
 * Best-effort detection of the Akash provider hosting this container.
 *
 * Strategy:
 *   1. Look up our public IP, then resolve each provider's hostUri via DNS and match exactly.
 *   2. If no host IP matches, fall back to the geographically closest provider by Haversine.
 *
 * Returns null on any failure — the page renders fine without a "you are here" marker.
 */
export async function detectCurrentProvider(providers: ProviderMarker[], deps: DetectDeps = {}): Promise<CurrentProvider | null> {
  if (providers.length === 0) return null;

  const fetchImpl = deps.fetchImpl ?? fetch;
  const lookup = deps.dnsLookup ?? defaultDnsLookup;

  let ipInfo: ServerLocation | null;
  try {
    ipInfo = await fetchServerLocation(fetchImpl);
  } catch {
    return null;
  }
  if (!ipInfo) return null;

  const hostMatch = await findByHostIp(providers, ipInfo.ip, lookup);
  if (hostMatch) return { marker: hostMatch, source: "ip-host", publicIp: ipInfo.ip };

  const closest = findClosest(providers, ipInfo.lat, ipInfo.lng);
  if (!closest) return null;
  return { marker: closest, source: "ip-geo", publicIp: ipInfo.ip };
}

async function findByHostIp(providers: ProviderMarker[], publicIp: string, lookup: DnsLookupFn): Promise<ProviderMarker | null> {
  const target = normalizeIp(publicIp);
  if (!target) return null;

  const lookups = providers.map(async provider => {
    const hostname = extractHostname(provider.hostUri);
    if (!hostname) return null;
    try {
      const result = await withTimeout(lookup(hostname), DNS_TIMEOUT_MS);
      if (!result?.address) return null;
      return normalizeIp(result.address) === target ? provider : null;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(lookups);
  return results.find((p): p is ProviderMarker => p !== null) ?? null;
}

function extractHostname(hostUri: string): string | null {
  if (!hostUri) return null;
  try {
    return new URL(hostUri).hostname;
  } catch {
    return null;
  }
}

function normalizeIp(ip: string): string {
  return ip.trim().replace(/^\[|\]$/g, "").toLowerCase();
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const defaultDnsLookup: DnsLookupFn = async hostname => {
  const result = await dnsLookup(hostname);
  return { address: result.address, family: result.family };
};

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
