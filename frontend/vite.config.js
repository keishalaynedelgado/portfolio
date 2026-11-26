import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Root is this frontend/ folder; the production build goes to frontend/dist,
// which backend/server.js serves.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
