import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// In Produktion liegt die Seite unter https://saifokaram1-hub.github.io/muslim-atlas/
// (bis die eigene Domain verbunden wird); lokal weiterhin unter /.
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/muslim-atlas/" : "/",
  plugins: [react(), tailwindcss()],
}));
