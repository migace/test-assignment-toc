import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "mock-api",
      configureServer(server) {
        server.middlewares.use("/api/toc", (_req, res) => {
          const filePath = resolve(__dirname, "src/mocks/HelpTOC.json");
          const data = readFileSync(filePath, "utf-8");
          res.setHeader("Content-Type", "application/json");
          res.end(data);
        });
      },
    },
  ],
});
