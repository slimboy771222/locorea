import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  hooks: {
    'pages:extend'(pages) {
      pages
        .filter(page => page.path.startsWith('/admin'))
        .forEach((page) => {
          page.meta = { ...page.meta, layout: 'admin' }
        })
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabasePublishableKey: '',
    },
  },
})
