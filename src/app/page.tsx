import { DocsLinks } from "@/components/DocsLinks";
import { Hero } from "@/components/Hero";
import { ProviderGlobe } from "@/components/ProviderGlobe";
import { detectCurrentProvider } from "@/lib/current-provider";
import { getNetworkSnapshot } from "@/lib/providers";

export const revalidate = 600;
export const dynamic = "force-static";

export default async function HomePage() {
  const snapshot = await getNetworkSnapshot();
  const currentProvider = await detectCurrentProvider(snapshot.providers);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <ProviderGlobe providers={snapshot.providers} currentProviderOwner={currentProvider?.marker.owner ?? null} />
      <Hero snapshot={snapshot} currentProvider={currentProvider} />
      <DocsLinks />
    </main>
  );
}
