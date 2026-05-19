"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { ProviderTooltip } from "@/components/ProviderTooltip";
import type { ProviderMarker } from "@/lib/types";

const ProviderGlobeScene = dynamic(() => import("@/components/ProviderGlobeScene").then(m => m.ProviderGlobeScene), {
  ssr: false,
  loading: () => <GlobeLoadingPlaceholder />
});

interface Props {
  providers: ProviderMarker[];
  currentProviderOwner: string | null;
}

const CONSOLE_PROVIDER_URL = "https://console.akash.network/providers";

export function ProviderGlobe({ providers, currentProviderOwner }: Props) {
  const [hovered, setHovered] = useState<ProviderMarker | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  const onClick = useCallback((marker: ProviderMarker) => {
    if (typeof window === "undefined") return;
    window.open(`${CONSOLE_PROVIDER_URL}/${marker.owner}`, "_blank", "noopener,noreferrer");
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className="absolute inset-0 h-full w-full">
      {!ready && <GlobeLoadingPlaceholder />}
      <div
        className="absolute inset-0 h-full w-full"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 400ms var(--ease-out)" }}
      >
        <ProviderGlobeScene
          providers={providers}
          currentProviderOwner={currentProviderOwner}
          onHover={setHovered}
          onPointerScreenPosition={setPointer}
          onClick={onClick}
          onReady={onReady}
        />
      </div>
      {hovered && pointer && ready && (
        <ProviderTooltip marker={hovered} x={pointer.x} y={pointer.y} isCurrent={hovered.owner === currentProviderOwner} />
      )}
    </div>
  );
}

function GlobeLoadingPlaceholder() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="globe-loading-ring" aria-label="loading the globe" role="status" />
    </div>
  );
}
