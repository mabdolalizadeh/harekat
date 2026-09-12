import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// Admin panel runs on 5174 so it doesn't clash with harekat-landing (5173).
// Served at /admin by the backend in production (see harekat-backend/src/app.js);
// HashRouter in main.jsx keeps routing working under any sub-path.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    allowedHosts: ['.ngrok-free.app'],
  },
})
