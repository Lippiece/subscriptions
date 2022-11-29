import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig( {
  build  : {},
  plugins: [ createHtmlPlugin( { inject: { data: { title: "subscriptions" } } } ) ],
} );
