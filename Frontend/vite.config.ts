import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5172",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    {
      name: 'dynamic-seo',
      transformIndexHtml: async (html, ctx) => {
        if (mode !== 'development') return html;
        try {
          // Use originalUrl to get the browser's request path (e.g., /product/123)
          const url = ctx.originalUrl || ctx.path;
          const response = await fetch(`http://127.0.0.1:5172/api/seo/data?path=${url}`);
          const seo = await response.json();
          if (!seo) return html;

          // Guard: skip empty-string values from DB — use fallback instead
          const title = (seo.title || "").trim() || "Luscent Glow | Pure Botanical Radiance";
          const description = (seo.description || "").trim() || "Premium, cruelty-free botanical skincare and makeup crafted for your authentic brilliance.";
          const keywords = (seo.keywords || "").trim() || "skincare, beauty, botanical, cruelty-free, luscent glow";
          const image = (seo.ogImage || "").trim() || "/og-image.png";

          // Inject Title
          html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
          html = html.replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${title}"`);
          html = html.replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${title}"`);
          
          // Inject Description
          html = html.replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${description}"`);
          html = html.replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${description}"`);
          html = html.replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${description}"`);
          
          // Inject Keywords
          html = html.replace(/<meta name="keywords" content=".*?"/, `<meta name="keywords" content="${keywords}"`);
          
          // Inject Images
          html = html.replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${image}"`);
          html = html.replace(/<meta name="twitter:image" content=".*?"/, `<meta name="twitter:image" content="${image}"`);

          return html;
        } catch (e) {
          console.warn('[*] Vite Dynamic SEO Sync Warning:', e.message);
          return html;
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
