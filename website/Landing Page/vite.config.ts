import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  define: {
    "process.env": {},
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    viteReact(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    // Emit images as separate cacheable files instead of base64-inlining them
    assetsInlineLimit: 0,
    cssCodeSplit: true,
  },
});
