# Hello from Akash 🌍

An interactive 3D map of every provider on the **Akash Network**, deployed as the canonical *Hello World* image that new users see when they click **Deploy** in [Akash Console](https://console.akash.network).

The page renders with [Next.js](https://nextjs.org) (App Router) and pulls live provider data from the public [Console API](https://akash.network/docs/api-documentation/console-api/getting-started/). The globe is drawn with **three.js** via [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) + [`three-globe`](https://github.com/vasturiano/three-globe). Hover a marker to see its region and uptime; click to open the provider on Console. When the app detects which Akash provider is hosting *this very container* it pulses that marker in green and shows a "running on" banner.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, standalone output) |
| 3D | three.js + `@react-three/fiber` + `@react-three/drei` + `three-globe` |
| Styling | Tailwind 4, dark-only surface, Inter + JetBrains Mono |
| Tests | Vitest |
| Container | Multi-stage Dockerfile → `ghcr.io/akash-network/hello-akash-world` |

## Develop

```bash
npm install
npm run dev       # http://localhost:3000
```

Override the Console API base if you're testing against a local API:

```bash
CONSOLE_API_URL=http://localhost:3080 npm run dev
```

## Verify

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run test        # vitest
npm run build       # next build (standalone)
```

The R3F scene itself is **not** unit-tested — canvas + three.js in jsdom is unreliable. Manual browser verification is required for visual changes to the globe.

## Build the Docker image

```bash
docker build -t hello-akash-world:dev .
docker run --rm -p 3000:3000 hello-akash-world:dev
```

## Release & publish

Push a `v*.*.*` tag (or run `Release` workflow manually) and CI builds + publishes multi-arch images to `ghcr.io/akash-network/hello-akash-world:<version>` and `:latest`.

```bash
npm version patch              # bumps package.json + creates v2.0.1 tag
git push origin main --tags    # triggers the Release workflow
```

## Deploy to Akash

```bash
# from this directory, with the akash CLI configured
akash tx deployment create deploy.yml --from <key>
```

…or paste [`deploy.yml`](./deploy.yml) into the SDL editor on [Akash Console](https://console.akash.network).

## "Running on this provider" detection

The page tries two strategies, in order:

1. `AKASH_PROVIDER_ADDRESS` env — set this in your SDL to pin the answer explicitly.
2. Fall back to geolocating the container's public IP (via [ipapi.co](https://ipapi.co)) and finding the geographically closest provider by Haversine distance.

If both fail, the banner is hidden and the globe renders normally.

## License

Apache-2.0 — see [LICENSE](./LICENSE).
