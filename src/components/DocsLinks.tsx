interface DocLink {
  title: string;
  description: string;
  href: string;
}

const DOCS: DocLink[] = [
  {
    title: "Quick start",
    description: "Deploy your first SDL in under five minutes.",
    href: "https://akash.network/docs/getting-started/quick-start/"
  },
  {
    title: "Stack Definition Language",
    description: "The YAML format Akash uses to describe a deployment.",
    href: "https://akash.network/docs/developers/deployment/akash-sdl/"
  },
  {
    title: "Console API",
    description: "Build apps on top of Akash with the public REST API.",
    href: "https://akash.network/docs/api-documentation/console-api/getting-started/"
  },
  {
    title: "GPU on Akash",
    description: "Train and serve models on decentralized GPUs.",
    href: "https://akash.network/pricing/gpus/"
  }
];

const SOCIALS: Array<{ label: string; href: string; icon: React.ReactNode }> = [
  { label: "GitHub", href: "https://github.com/akash-network/console", icon: <GithubIcon /> },
  { label: "Discord", href: "https://discord.akash.network", icon: <DiscordIcon /> },
  { label: "X", href: "https://x.com/akashnet", icon: <XIcon /> },
  { label: "YouTube", href: "https://www.youtube.com/@AkashNetwork", icon: <YouTubeIcon /> }
];

export function DocsLinks() {
  return (
    <section className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-8 sm:px-10 sm:pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="pointer-events-auto grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map(doc => (
            <a key={doc.href} href={doc.href} target="_blank" rel="noopener noreferrer" className="card group p-4 transition hover:border-line-bold hover:bg-bg-elev-2">
              <div className="flex items-center justify-between text-[13px] font-semibold text-fg">
                <span>{doc.title}</span>
                <span className="text-fg-faint transition group-hover:translate-x-0.5 group-hover:text-accent">→</span>
              </div>
              <p className="mt-1 text-[12px] text-fg-muted">{doc.description}</p>
            </a>
          ))}
        </div>

        <div className="pointer-events-auto mt-6 flex items-center justify-center gap-5 text-fg-subtle">
          {SOCIALS.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="transition hover:text-fg">
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
