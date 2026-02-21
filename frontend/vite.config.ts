import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // Keep these for WSL stability
    watch: {
      usePolling: true,
    },
    host: true,
    port: 5173,
  },
});
