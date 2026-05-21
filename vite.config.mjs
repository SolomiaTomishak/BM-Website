import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const pages = [
  "index",
  "reports",
  "post",
  "contacts",
  "login",
  "admin",
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(rootDir, `html/${page}.html`)]),
      ),
    },
  },
});
