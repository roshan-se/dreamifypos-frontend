// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ["@pinia/nuxt", "nuxt-toastify"],
  toastify: {
    autoClose: 3000,
    position: 'top-right',
    theme: 'auto',
  },
})