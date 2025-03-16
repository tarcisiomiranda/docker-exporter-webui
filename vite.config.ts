import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const API_BASE_URL = process.env.VITE_API_BASE_URL || (
    mode === 'production'
      ? 'https://URL_PRODUCTION'
      : mode === 'homologation'
        ? 'https://URL_HOMOLOGATION'
        : 'https://docker-exporter-api.srelab.xyz'
  );

  console.log(`[Vite Build] Mode: ${mode}`);
  console.log(`[Vite Build] API_BASE_URL: ${API_BASE_URL}`);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      ...(mode === 'development' ? [
        /* your development plugins here */
      ] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(API_BASE_URL),
      global: 'globalThis',
    }
  };
});
