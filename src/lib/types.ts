export interface ApiProvider {
  owner: string;
  name: string | null;
  hostUri: string;
  isOnline: boolean;
  isAudited: boolean;
  ipLat: string | null;
  ipLon: string | null;
  ipRegion: string | null;
  ipCountry: string | null;
  ipCountryCode: string | null;
  uptime30d: number | null;
  deploymentCount?: number | null;
  leaseCount?: number | null;
  gpuModels: Array<{ vendor: string; model: string; ram: string; interface: string }>;
  hardwareGpuVendor?: string | null;
  city?: string | null;
}

export interface ProviderMarker {
  owner: string;
  name: string;
  hostUri: string;
  lat: number;
  lng: number;
  region: string;
  country: string;
  countryCode: string | null;
  uptime30d: number;
  hasGpu: boolean;
  audited: boolean;
  city: string | null;
}

export interface NetworkSnapshot {
  providers: ProviderMarker[];
  totalProviders: number;
  totalCountries: number;
  totalRegions: number;
  gpuProviders: number;
  fetchedAt: string;
}
