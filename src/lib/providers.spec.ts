import { describe, expect, it, vi } from "vitest";

import { buildSnapshot, getNetworkSnapshot } from "@/lib/providers";
import type { ApiProvider } from "@/lib/types";

describe("buildSnapshot", () => {
  it("filters out offline providers", () => {
    const result = buildSnapshot(
      [makeProvider({ owner: "online", isOnline: true }), makeProvider({ owner: "offline", isOnline: false })],
      new Date("2026-05-14T00:00:00Z")
    );

    expect(result.providers).toHaveLength(1);
    expect(result.providers[0].owner).toBe("online");
  });

  it("filters out providers missing lat/lon", () => {
    const result = buildSnapshot(
      [makeProvider({ owner: "with-coords" }), makeProvider({ owner: "missing-lat", ipLat: null }), makeProvider({ owner: "missing-lon", ipLon: null })],
      new Date()
    );

    expect(result.providers.map(p => p.owner)).toEqual(["with-coords"]);
  });

  it("rejects null-island (0,0) coordinates that usually mean unknown", () => {
    const result = buildSnapshot([makeProvider({ owner: "null-island", ipLat: "0", ipLon: "0" })], new Date());
    expect(result.providers).toHaveLength(0);
  });

  it("rejects non-numeric coordinate strings", () => {
    const result = buildSnapshot([makeProvider({ owner: "junk", ipLat: "nope", ipLon: "lol" })], new Date());
    expect(result.providers).toHaveLength(0);
  });

  it("counts unique country codes case-insensitively", () => {
    const result = buildSnapshot(
      [
        makeProvider({ owner: "a", ipCountryCode: "us" }),
        makeProvider({ owner: "b", ipCountryCode: "US" }),
        makeProvider({ owner: "c", ipCountryCode: "DE" })
      ],
      new Date()
    );
    expect(result.totalCountries).toBe(2);
  });

  it("counts providers with any GPU model or hardware GPU vendor as GPU providers", () => {
    const result = buildSnapshot(
      [
        makeProvider({ owner: "gpu1", gpuModels: [{ vendor: "nvidia", model: "h100", ram: "80Gi", interface: "pcie" }] }),
        makeProvider({ owner: "gpu2", hardwareGpuVendor: "amd" }),
        makeProvider({ owner: "no-gpu" })
      ],
      new Date()
    );
    expect(result.gpuProviders).toBe(2);
  });

  it("uses the provided fetch timestamp", () => {
    const fetchedAt = new Date("2026-05-14T12:00:00Z");
    const result = buildSnapshot([makeProvider()], fetchedAt);
    expect(result.fetchedAt).toBe(fetchedAt.toISOString());
  });

  it("flags fallback snapshots with epoch timestamp so the UI can tell them apart", () => {
    const result = buildSnapshot([makeProvider()], new Date(), { isFallback: true });
    expect(result.fetchedAt).toBe(new Date(0).toISOString());
  });

  it("falls back to a shortened owner address when name is empty", () => {
    const result = buildSnapshot([makeProvider({ name: "  " })], new Date());
    expect(result.providers[0].name).not.toBe("");
    expect(result.providers[0].name).toContain("…");
  });
});

describe("getNetworkSnapshot", () => {
  it("returns the snapshot from the API on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([makeProvider({ owner: "live" })]), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const snapshot = await getNetworkSnapshot({ fetchImpl, apiBaseUrl: "https://api.test", now: () => new Date("2026-05-14T00:00:00Z") });

    expect(snapshot.providers).toHaveLength(1);
    expect(snapshot.providers[0].owner).toBe("live");
    expect(fetchImpl).toHaveBeenCalledWith("https://api.test/v1/providers?scope=all", expect.objectContaining({ headers: { accept: "application/json" } }));
  });

  it("falls back to the bundled snapshot when the API returns non-2xx", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 503 }));
    const snapshot = await getNetworkSnapshot({ fetchImpl, apiBaseUrl: "https://api.test" });
    expect(snapshot.providers.length).toBeGreaterThan(0);
    expect(snapshot.fetchedAt).toBe(new Date(0).toISOString());
  });

  it("falls back when fetch throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("net down"));
    const snapshot = await getNetworkSnapshot({ fetchImpl, apiBaseUrl: "https://api.test" });
    expect(snapshot.providers.length).toBeGreaterThan(0);
  });
});

function makeProvider(overrides: Partial<ApiProvider> = {}): ApiProvider {
  return {
    owner: "akash1example000000000000000000000000000000",
    name: "Example Provider",
    hostUri: "https://example.com:8443",
    isOnline: true,
    isAudited: true,
    ipLat: "40.7128",
    ipLon: "-74.0060",
    ipRegion: "New York",
    ipCountry: "United States",
    ipCountryCode: "US",
    uptime30d: 0.99,
    gpuModels: [],
    hardwareGpuVendor: null,
    city: "New York",
    ...overrides
  };
}
