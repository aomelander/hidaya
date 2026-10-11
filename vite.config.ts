process.env.VINEXT_NO_DEV_LOCK = "1";

import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

// Ensure .dev.vars is populated from environment variables for Cloudflare workerd SSR runtime
try {
  const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
  const keys = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "GEMINI_API_KEY"];
  const lines = keys
    .filter((k) => Boolean(process.env[k]))
    .map((k) => `${k}=${process.env[k]}`);
  if (lines.length > 0) {
    fs.writeFileSync(devVarsPath, lines.join("\n") + "\n", "utf8");
  }
} catch {
  // Ignore read-only filesystem environments
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: ["localhost"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});

