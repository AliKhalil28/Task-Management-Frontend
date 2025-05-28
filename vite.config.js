import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Make process.env available in the client
    "process.env": {},
  },
  server: {
    proxy: {
      // Proxy API requests during development
      "/api": {
        target: "https://taks-management-system-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
