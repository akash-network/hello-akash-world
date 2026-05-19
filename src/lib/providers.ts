import fallbackData from "@/lib/providers.fallback.json";
import type { ApiProvider, NetworkSnapshot, ProviderMarker } from "@/lib/types";

const DEFAULT_API = "https://console-api.akash.network";
const FETCH_TIMEOUT_MS = 6000;

export interface FetchDeps {
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
  now?: () => Date;
}

export async function getNetworkSnapshot(deps: FetchDeps = {}): Promise<NetworkSnapshot> {
  const apiBaseUrl = deps.apiBaseUrl ?? process.env.CONSOLE_API_URL ?? DEFAULT_API;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());

  const url = `${apiBaseUrl.replace(/\/$/, "")}/v1/providers?scope=all`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetchImpl(url, { signal: controller.signal, headers: { accept: "application/json" } });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Console API returned ${res.status}`);
    const raw = (await res.json()) as ApiProvider[];
    return buildSnapshot(raw, now());
  } catch {
    return buildSnapshot(fallbackData as ApiProvider[], now(), { isFallback: true });
  }
}

export function buildSnapshot(providers: ApiProvider[], fetchedAt: Date, opts: { isFallback?: boolean } = {}): NetworkSnapshot {
  const markers = providers.filter(isMappable).map(toMarker);

  const countries = new Set<string>();
  const regions = new Set<string>();
  let gpuProviders = 0;

  for (const marker of markers) {
    countries.add((marker.countryCode ?? marker.country).toUpperCase());
    if (marker.region) regions.add(marker.region);
    if (marker.hasGpu) gpuProviders += 1;
  }

  return {
    providers: markers,
    totalProviders: markers.length,
    totalCountries: countries.size,
    totalRegions: regions.size,
    gpuProviders,
    fetchedAt: (opts.isFallback ? new Date(0) : fetchedAt).toISOString()
  };
}

function isMappable(p: ApiProvider): boolean {
  if (!p.isOnline) return false;
  if (!p.ipLat || !p.ipLon) return false;
  const lat = Number.parseFloat(p.ipLat);
  const lng = Number.parseFloat(p.ipLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

function toMarker(p: ApiProvider): ProviderMarker {
  const lat = Number.parseFloat(p.ipLat!);
  const lng = Number.parseFloat(p.ipLon!);
  const hasGpu = (p.gpuModels?.length ?? 0) > 0 || Boolean(p.hardwareGpuVendor);
  return {
    owner: p.owner,
    name: p.name?.trim() || shortenAddress(p.owner),
    hostUri: p.hostUri,
    lat,
    lng,
    region: p.ipRegion ?? "",
    country: p.ipCountry ?? "Unknown",
    countryCode: p.ipCountryCode,
    uptime30d: p.uptime30d ?? 0,
    hasGpu,
    audited: p.isAudited,
    city: p.city ?? p.ipRegion ?? null
  };
}

function shortenAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}
