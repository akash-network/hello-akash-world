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

  it("returns ip-host match when our public IP resolves to a provider's hostUri", async () => {
    const providers: ProviderMarker[] = [
      marker("eu", 50, 8, "https://provider.eu.example:8443"),
      marker("us", 39, -77, "https://provider.us.example:8443")
    ];
    const fetchImpl = mockGeoResponse({ ip: "203.0.113.10", latitude: 50.1, longitude: 8.6 });
    const dnsLookup = vi.fn(async (hostname: string) => {
      if (hostname === "provider.us.example") return { address: "203.0.113.10", family: 4 };
      return { address: "198.51.100.1", family: 4 };
    });

    const result = await detectCurrentProvider(providers, { fetchImpl, dnsLookup });

    expect(result?.source).toBe("ip-host");
    expect(result?.marker.owner).toBe("us");
    expect(result?.publicIp).toBe("203.0.113.10");
  });

  it("falls back to geographically closest provider when no host IP matches", async () => {
    const providers: ProviderMarker[] = [
      marker("eu", 50, 8, "https://provider.eu.example:8443"),
      marker("us", 39, -77, "https://provider.us.example:8443")
    ];
    const fetchImpl = mockGeoResponse({ ip: "1.2.3.4", latitude: 50.1, longitude: 8.6 });
    const dnsLookup = vi.fn(async () => ({ address: "198.51.100.1", family: 4 }));

    const result = await detectCurrentProvider(providers, { fetchImpl, dnsLookup });

    expect(result?.source).toBe("ip-geo");
    expect(result?.marker.owner).toBe("eu");
    expect(result?.publicIp).toBe("1.2.3.4");
  });

  it("tolerates DNS failures on individual providers", async () => {
    const providers: ProviderMarker[] = [
      marker("broken", 50, 8, "https://broken.example:8443"),
      marker("us", 39, -77, "https://provider.us.example:8443")
    ];
    const fetchImpl = mockGeoResponse({ ip: "203.0.113.10", latitude: 39, longitude: -77 });
    const dnsLookup = vi.fn(async (hostname: string) => {
      if (hostname === "broken.example") throw new Error("ENOTFOUND");
      return { address: "203.0.113.10", family: 4 };
    });

    const result = await detectCurrentProvider(providers, { fetchImpl, dnsLookup });

    expect(result?.source).toBe("ip-host");
    expect(result?.marker.owner).toBe("us");
  });

  it("returns null when geolocation lookup fails", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8, "https://provider.eu.example:8443")];
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network"));
    const dnsLookup = vi.fn();

    const result = await detectCurrentProvider(providers, { fetchImpl, dnsLookup });

    expect(result).toBeNull();
    expect(dnsLookup).not.toHaveBeenCalled();
  });

  it("returns null when geolocation response has no coordinates", async () => {
    const providers: ProviderMarker[] = [marker("eu", 50, 8, "https://provider.eu.example:8443")];
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "rate limited" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const result = await detectCurrentProvider(providers, { fetchImpl, dnsLookup: vi.fn() });

    expect(result).toBeNull();
  });
});

function mockGeoResponse(body: { ip: string; latitude: number; longitude: number }) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" }
    })
  );
}

function marker(owner: string, lat: number, lng: number, hostUri = `https://${owner}.example:8443`): ProviderMarker {
  return {
    owner,
    name: owner,
    hostUri,
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
