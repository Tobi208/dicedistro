// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    css: {
      preprocessorOptions: {
        sass: {
          additionalData : '@use "~/assets/sass/_colors.sass" as *\n@use "~/assets/sass/_mixins.sass" as *'
        }
      }
    }
  },
  app: {
    baseURL: '/dicedistro/'
  }
})
