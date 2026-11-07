import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      proxy: env.API_PROXY_TARGET
      ? {
          "/backend": {
            target: env.API_PROXY_TARGET,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/backend/, ""),
            configure: (proxy) => {
              proxy.on("proxyReq", (proxyReq) => {
                proxyReq.removeHeader("origin");
              });
            },
          },
        }
      : undefined,
    },
  };
});
