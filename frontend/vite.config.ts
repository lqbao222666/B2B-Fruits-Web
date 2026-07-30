import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(), // Tích hợp Tailwind v4 vào Vite build process
  ],
  resolve: {
    alias: {
      // Định nghĩa ký tự `@` trỏ thẳng vào thư mục `src`
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
