export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  devServer: {
    host: 'localhost',
    port: 3000,
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],

  css: ['primeicons/primeicons.css'],

  build: {
    transpile: ['primevue'],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:2999',
    },
  },
});
