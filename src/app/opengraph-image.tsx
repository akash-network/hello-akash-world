import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hello from Akash — the decentralized supercloud, live.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, rgba(255, 41, 3, 0.18), transparent 60%), radial-gradient(ellipse at 90% 10%, rgba(140, 140, 255, 0.10), transparent 50%)",
          color: "#fafafa",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="49" viewBox="0 0 481 420" xmlns="http://www.w3.org/2000/svg">
            <path d="M400.697 419.061L480.661 279.423L320.601 0.0800781H160.54L400.697 419.061Z" fill="#FF414C" />
            <path d="M321.481 279.398L400.74 419.036H240.636L160.54 279.398H321.481Z" fill="#FF414C" fillOpacity="0.55" />
            <path d="M80.5114 139.682H240.573L80.578 419.025L0.481445 279.387L80.5114 139.682Z" fill="#FF414C" />
          </svg>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#ff2903"
            }}
          >
            Hello from Akash
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#fafafa"
            }}
          >
            The decentralized supercloud, live.
          </div>
          <div style={{ fontSize: 28, color: "#ababaf", maxWidth: 880 }}>
            An interactive map of every provider on the Akash Network.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 16,
            color: "#86868b",
            letterSpacing: 2,
            textTransform: "uppercase"
          }}
        >
          <span>akash.network</span>
          <span>open · decentralized · permissionless</span>
        </div>
      </div>
    ),
    size
  );
}
