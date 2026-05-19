"use client";

import type { ProviderMarker } from "@/lib/types";

interface Props {
  marker: ProviderMarker;
  x: number;
  y: number;
  isCurrent: boolean;
}

const TOOLTIP_OFFSET = 16;
const TOOLTIP_WIDTH = 280;

export function ProviderTooltip({ marker, x, y, isCurrent }: Props) {
  const viewportWidth = typeof window === "undefined" ? 1200 : window.innerWidth;
  const left = Math.min(x + TOOLTIP_OFFSET, viewportWidth - TOOLTIP_WIDTH - 8);
  const top = y + TOOLTIP_OFFSET;
  const flag = marker.countryCode ? countryCodeToFlag(marker.countryCode) : "";

  return (
    <div className="card-strong anim-fade-in pointer-events-none fixed z-50 px-4 py-3 shadow-[var(--shadow-strong)] backdrop-blur" style={{ left, top, width: TOOLTIP_WIDTH }} role="tooltip">
      {isCurrent && <div className="eyebrow mb-1.5 !text-[var(--color-ok)]">You are here</div>}
      <div className="flex items-center gap-2 text-[14px] font-semibold text-fg">
        <span className="text-base leading-none">{flag}</span>
        <span className="truncate">{marker.name}</span>
      </div>
      <div className="mt-1 text-[12px] text-fg-muted">{[marker.city, marker.region, marker.country].filter(Boolean).join(", ")}</div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        <span className="pill pill-mono">
          <span className="text-fg-subtle">Uptime 30d</span>
          <span>{formatUptime(marker.uptime30d)}</span>
        </span>
        {marker.audited && <span className="pill pill-ok pill-mono">audited</span>}
        {marker.hasGpu && <span className="pill pill-mono !text-[var(--color-bid)] !border-[color:color-mix(in_srgb,var(--bid)_28%,transparent)]">GPU</span>}
      </div>
      <div className="eyebrow mt-3 !text-[10px] !text-fg-faint">Click to view on Console →</div>
    </div>
  );
}

function formatUptime(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "n/a";
  return `${(value * 100).toFixed(2)}%`;
}

function countryCodeToFlag(code: string): string {
  if (code.length !== 2) return "";
  const base = 127397;
  return String.fromCodePoint(...code.toUpperCase().split("").map(c => c.charCodeAt(0) + base));
}
