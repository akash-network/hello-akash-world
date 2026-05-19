import { describe, expect, it, vi } from "vitest";

import { detectCurrentProvider, findClosest, haversineKm } from "@/lib/current-provider";
import type { ProviderMarker } from "@/lib/types";

describe("haversineKm", () => {
  it("returns 0 between identical coordinates", () => {
    expect(haversineKm(40.7, -74, 40.7, -74)).toBeCloseTo(0, 1);
  });

  it("computes a known great-circle distance (NYC → LA ≈ 3940 km)", () => {
    const d = haversineKm(40.7128, -74.006, 34.0522, -118.2437);
    expect(d).toBeGreaterThan(3900);
    expect(d).toBeLessThan(3990);
  });

  it("is symmetric", () => {
    const a = haversineKm(48.8566, 2.3522, 35.6762, 139.6503);
    const b = haversineKm(35.6762, 139.6503, 48.8566, 2.3522);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("findClosest", () => {
  it("returns null on an empty provider list", () => {
    expect(findClosest([], 0, 0)).toBeNull();
  });

  it("picks the geographically nearest provider", () => {
    const providers: ProviderMarker[] = [marker("eu", 50.1, 8.68), marker("us", 39.04, -77.48), marker("sg", 1.35, 103.81)];

    expect(findClosest(providers, 48.85, 2.35)?.owner).toBe("eu");
    expect(findClosest(providers, 37.77, -122.41)?.owner).toBe("us");
    expect(findClosest(providers, 13.75, 100.5)?.owner).toBe("sg");
  });
});

describe("detectCurrentProvider", () => {
  it("returns null when no providers are available", async () => {
    const result = await detectCurrentProvider([]);
    expect(result).toBeNull();
  });

  it("prefers AKASH_PROVIDER_ADDRESS over IP geolocation", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8), marker("pinned", 0, 0)];
    const fetchImpl = vi.fn();
    const result = await detectCurrentProvider(providers, { env: { AKASH_PROVIDER_ADDRESS: "pinned" }, fetchImpl });
    expect(result?.source).toBe("env");
    expect(result?.marker.owner).toBe("pinned");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("ignores an AKASH_PROVIDER_ADDRESS that doesn't match any provider and falls back to geolocation", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8)];
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ip: "1.2.3.4", latitude: 50.1, longitude: 8.6 }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    const result = await detectCurrentProvider(providers, { env: { AKASH_PROVIDER_ADDRESS: "unknown" }, fetchImpl });
    expect(result?.source).toBe("ip-geo");
    expect(result?.marker.owner).toBe("eu");
  });

  it("returns null when geolocation lookup fails", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8)];
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network"));
    const result = await detectCurrentProvider(providers, { env: {}, fetchImpl });
    expect(result).toBeNull();
  });

  it("returns null when geolocation response has no coordinates", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8)];
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "rate limited" }), { status: 200, headers: { "content-type": "application/json" } }));
    const result = await detectCurrentProvider(providers, { env: {}, fetchImpl });
    expect(result).toBeNull();
  });

  it("picks the closest provider by Haversine when geolocation succeeds", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8), marker("us", 39, -77), marker("sg", 1.35, 103)];
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ip: "1.1.1.1", latitude: 37.77, longitude: -122.41 }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    const result = await detectCurrentProvider(providers, { env: {}, fetchImpl });
    expect(result?.marker.owner).toBe("us");
    expect(result?.publicIp).toBe("1.1.1.1");
  });
});

function marker(owner: string, lat: number, lng: number): ProviderMarker {
  return {
    owner,
    name: owner,
    lat,
    lng,
    region: "",
    country: "",
    countryCode: null,
    uptime30d: 0.99,
    hasGpu: false,
    audited: false,
    city: null
  };
}
