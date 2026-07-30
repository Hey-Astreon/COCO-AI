import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      // Replace the Node.js-only AsyncLocalStorage package with a browser-safe stub.
      // Without this, @tanstack/start-storage-context crashes the browser bundle
      // with "TypeError: AsyncLocalStorage is not a constructor".
      "@tanstack/start-storage-context": path.resolve(
        __dirname,
        "src/stubs/start-storage-context.ts"
      ),
    },
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    viteReact(),
  ],
});
