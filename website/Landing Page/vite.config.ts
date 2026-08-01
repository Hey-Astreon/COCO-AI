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
  build: {
    chunkSizeWarningLimit: 550,
    // Emit images as separate cacheable files instead of base64-inlining them
    // into lazy chunks (several platform logos are under the 4KB default limit).
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // Split the framework libs into dedicated vendor chunks so the entry
        // bundle (and every section chunk) stays under 500 kB.
        advancedChunks: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/
            },
            {
              name: "router-vendor",
              test: /node_modules[\\/]@tanstack[\\/]/
            },
            {
              name: "data-vendor",
              test: /node_modules[\\/](@supabase|sonner|lucide-react)[\\/]/
            }
          ]
        },
      },
    },
  },
});
