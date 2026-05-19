import type { CurrentProvider } from "@/lib/current-provider";
import type { NetworkSnapshot } from "@/lib/types";

interface Props {
  snapshot: NetworkSnapshot;
  currentProvider: CurrentProvider | null;
}

export function Hero({ snapshot, currentProvider }: Props) {
  return (
    <section className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-8 sm:px-10 sm:pt-12">
      <div className="anim-slide-up mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-3 !text-[color:var(--accent-eyebrow)]">Hello from Akash</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-6xl">The decentralized supercloud, live.</h1>
        <p className="mx-auto mt-4 max-w-xl text-[13px] text-fg-muted sm:text-base">
          <span className="mono font-semibold text-fg">{snapshot.totalProviders}</span> online providers across{" "}
          <span className="mono font-semibold text-fg">{snapshot.totalCountries}</span> countries are renting out compute right now, and{" "}
          <span className="mono font-semibold text-fg">{snapshot.gpuProviders}</span> of them have GPUs ready to go.
        </p>

        {currentProvider && (
          <div className="pointer-events-auto card-strong mx-auto mt-6 inline-flex max-w-md items-center gap-3 px-4 py-2 text-[12px] backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-ok)] opacity-60 dot-pulse" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-ok)]" />
            </span>
            <span className="text-left">
              <span className="eyebrow !text-[var(--color-ok)]">This deployment runs on</span>
              <div className="text-[13px] text-fg">
                <a
                  href={`https://console.akash.network/providers/${currentProvider.marker.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-fg-faint underline-offset-4 hover:decoration-fg"
                >
                  {currentProvider.marker.name}
                </a>{" "}
                <span className="text-fg-subtle">· {[currentProvider.marker.city, currentProvider.marker.country].filter(Boolean).join(", ") || "location unknown"}</span>
              </div>
            </span>
          </div>
        )}

        <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3">
          <a href="https://console.akash.network" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Deploy your first app →
          </a>
          <a href="https://akash.network/docs/getting-started/quick-start/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
