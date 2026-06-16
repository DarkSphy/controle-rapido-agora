import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    optimizeDeps: {
      include: ['jspdf-autotable'],
    },
    ssr: {
      noExternal: ['jspdf-autotable'],
    },
  },
});
