// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  runtimeConfig: {
    // server‑only values (no prefix needed)
    // secretKey: process.env.MY_SECRET,

    public: {
      // client‑safe: match your .env name (minus the NUXT_PUBLIC_ prefix)
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
      imageBase: process.env.NUXT_PUBLIC_IMAGE_BASE || '',
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    "@pinia/nuxt",
    "nuxt-toastify",
    'shadcn-nuxt',
    '@nuxtjs/google-fonts',
  ],
  toastify: {
    autoClose: 3000,
    position: 'top-right',
    theme: 'auto',
  },
  googleFonts: {
    families: {
      'Inter': {
        wght: [300, 400, 500, 600, 700]
      }
    }
  }
})