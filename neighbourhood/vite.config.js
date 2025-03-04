import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Base configuration
  base: './', // Ensures correct base path for assets and routes
  server: {
    open: true, // Automatically open the browser on dev server start
    port: 3000, // Optional: Specify a port if needed
  },

  // Plugins
  plugins: [react(), tailwindcss()],

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': '/src', // Maps '@' to the 'src' directory for cleaner imports
    },
    // Optionally, enforce explicit extensions for imports
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Ensure Vite resolves .js files
  },

  // Build configuration (optional, for production)
  build: {
    outDir: 'dist', // Output directory for the build
    assetsDir: 'assets', // Directory for static assets
    sourcemap: true, // Enable sourcemaps for debugging
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'], // Pre-bundle Firebase dependencies
  },

  // Logging and debugging
  logLevel: 'info', // Set to 'debug' for more detailed import resolution logs

  // Custom server middleware or environment variables (optional)
  define: {
    'process.env': {}, // Polyfill for Node.js process.env if needed for Firebase
  },
});