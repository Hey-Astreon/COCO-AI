import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  define: {
    "process.env": {},
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    viteReact(),
  ],
});
