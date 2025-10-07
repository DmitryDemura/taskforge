export default defineNuxtConfig({
  compatibilityDate: '2025-09-09',

  // SPA mode - disable SSR completely
  ssr: false,

  // Use app directory structure
  srcDir: 'app',

  devtools: {
    enabled: false,
  },

  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },

  css: [
    '@/assets/css/fonts.css',
    'primevue/resources/themes/lara-light-blue/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
    '@/assets/styles/main.scss',
    '@/assets/styles/themes.scss',
  ],

  app: {
    head: {
      title: 'TaskForge UI',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  routeRules: {
    '/api/**': { proxy: 'http://localhost:2999/**' },
  },

  build: {
    transpile: ['primevue'],
  },

  runtimeConfig: {
    public: { apiBase: '/api' },
  },

  // Disable features that might use oxc-parser
  experimental: {
    payloadExtraction: false,
    watcher: 'chokidar',
  },

  nitro: {
    devProxy: { '/api/': { target: 'http://localhost:2999/', changeOrigin: true } },
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
