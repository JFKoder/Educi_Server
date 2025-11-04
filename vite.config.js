import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: true, // listen on all interfaces
    port: 5173, // optional: fix the port
    strictPort: true, // optional: fail if port is taken
    allowedHosts: ["dev.educi.app"], // <-- allow Cloudflare host
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
