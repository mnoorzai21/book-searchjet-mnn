import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Send API calls to the Express server during development.
    proxy: {
      "/graphql": "http://localhost:3001",
    },
  },
});
