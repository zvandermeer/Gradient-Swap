import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      allowedHosts: env.ALLOWED_HOSTS_VITE_SERVER.split(" "),
    },
    preview: {
      allowedHosts: env.ALLOWED_HOSTS_VITE_PREVIEW.split(" "),
    },
    plugins: [
      react(),
      VitePWA({
        includeAssets: ["icons/favicon.ico", "icons/apple-touch-icon.png"],
        workbox: {
          globPatterns: ["**/*.{js,css,html,ttf}"],
        },
        registerType: "autoUpdate",
        manifest: {
          name: "Colour Swap",
          short_name: "Colour Swap",
          id: "https://gradient.starlightt.xyz",
          description:
            "A beautiful, infinitely replayable, randomly generated gradient tile swapping game, built in ReactJS.",
          start_url: "/",
          scope: "/",
          background_color: "#fff9e7",
          theme_color: "#fff9e7",
          display: "standalone",
          orientation: "portrait",
          icons: [
            {
              src: "/icons/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icons/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icons/pwa-maskable-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/icons/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          categories: ["games"],
          dir: "ltr",
          launch_handler: {
            client_mode: ["focus-existing", "auto"],
          },
        },
      }),
    ],
  };
});
