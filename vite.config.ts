import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // tells Vite to use relative paths
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
