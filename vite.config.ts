import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  base: "/pod2nix",
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: true,
      prerender: {
        enabled: true,
        crawlLinks: false,
      },
    }),
    viteReact(),
  ],
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-router"],
  },
  build: {
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
  },
});

export default config;
