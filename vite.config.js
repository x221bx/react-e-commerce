import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ['al-preevident-nonatheistically.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Handle direct access to source files
    historyApiFallback: true,
    // Custom middleware to prevent serving source files
    setupMiddlewares: (middlewares, server) => {
      server.middlewares.use((req, res, next) => {
        // Check if the request is for a source file in the src directory
        if (req.url && req.url.startsWith('/src/')) {
          // Return 404 for source files
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end('<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested resource does not exist.</p></body></html>');
          return;
        }
        next();
      });
      return middlewares;
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase'],
          ui: ['lucide-react', 'react-icons'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
