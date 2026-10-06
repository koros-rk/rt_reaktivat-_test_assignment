import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/shared/testing/setup.ts"],
    mockReset: true,
    unstubGlobals: true,
    css: false,
    coverage: {
      provider: "v8",
      include: [
        "src/**/model/**",
        "src/**/lib/**",
        "src/entities/**",
        "src/shared/lib/**",
      ],
      exclude: ["src/**/ui/**", "src/**/*.test.*", "src/shared/testing/**"],
    },
  },
});
