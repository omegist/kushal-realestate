import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";
import dotenv from "dotenv";

// Load .env into process.env for the dev middleware (Vite only exposes VITE_* to the browser).
// This must run at config-load time so process.env is ready before any handler is called.
dotenv.config();

// ─── Dev API middleware ───────────────────────────────────────────────────────
// Handles /api/* routes during `npm run dev` so the app works without Vercel CLI.
// In production these are served by Vercel serverless functions in /api/.
function devApiPlugin() {
  return {
    name: "dev-api",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith("/api/")) return next();

        // Collect request body
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve) => {
          req.on("data", (c: Buffer) => chunks.push(c));
          req.on("end", resolve);
        });
        const body = Buffer.concat(chunks).toString();

        try {
          // Dynamically import the handler — runs in Node, has access to process.env
          if (req.url === "/api/upload") {
            const { handler } = await import("./api/upload.js");
            const result = await handler(JSON.parse(body || "{}"));
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } else if (req.url === "/api/delete-files") {
            const { handler } = await import("./api/delete-files.js");
            const result = await handler(JSON.parse(body || "{}"));
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } else if (req.url?.startsWith("/api/storage-usage")) {
            const { handler } = await import("./api/storage-usage.js");
            const result = await handler(req);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } else {
            next();
          }
        } catch (err: any) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err?.message ?? "Internal error" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    devApiPlugin(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});