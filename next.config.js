const { version } = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: version
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "three-globe"]
};

module.exports = nextConfig;
