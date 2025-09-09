export default defineNuxtConfig({
  compatibilityDate: '2025-09-09',

  // SPA mode - disable SSR completely
  ssr: false,

  // Use app directory structure
  srcDir: 'app/',

  devtools: {
    enabled: false,
  },

  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },

  // Minimal modules to avoid oxc-parser issues
  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://api:2999/api',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:2999/api',
    },
  },

  // Disable features that might use oxc-parser
  experimental: {
    payloadExtraction: false,
    watcher: 'chokidar',
  },

  nitro: {
    minify: false,
  },

  // Use vite with custom configuration
  vite: {
    optimizeDeps: {
      exclude: ['@rollup/rollup-linux-x64-musl', 'oxc-parser'],
    },
    build: {
      rollupOptions: {
        external: ['@rollup/rollup-linux-x64-musl', 'oxc-parser'],
      },
    },
    define: {
      'process.env.DISABLE_OXC': 'true',
    },
  },

  // Disable oxc-parser completely
  typescript: {
    typeCheck: false,
  },

  // Force use of esbuild instead of oxc
  builder: 'vite',
});
