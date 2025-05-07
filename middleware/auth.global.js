// middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  // grab the layout that this route will use (defaults to 'default')
  const layout = (to.meta.layout) || 'default'
  const publicLayouts = ['auth']     // only 'auth' pages are public

  if (process.client && !localStorage.getItem('token')) {
    if (!publicLayouts.includes(layout)) {
      return navigateTo('/login')
    }
  }
})
