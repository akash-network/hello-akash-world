const { version } = require("./package.json");
const withPWA = require("next-pwa");

const isDev = process.env.NODE_ENV === "development";
module.exports = withPWA({
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: isDev
  },
  transpilePackages: ["geist"],
  reactStrictMode: true,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  experimental: {
    outputStandalone: true
  },
  publicRuntimeConfig: {
    version
  }
});
