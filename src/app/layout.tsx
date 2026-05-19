import "@/app/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Hello from Akash",
  description: "An interactive map of every provider on the Akash Network — the decentralized supercloud.",
  metadataBase: new URL("https://console.akash.network"),
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" }
    ],
    shortcut: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#ff2903" }]
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Akash Network",
    title: "Hello from Akash",
    description: "An interactive map of every provider on the Akash Network."
  },
  twitter: {
    card: "summary_large_image",
    title: "Hello from Akash",
    description: "An interactive map of every provider on the Akash Network."
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem themes={["light", "dark"]} disableTransitionOnChange>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
