const siteUrl = 'https://rezansrv.ir'
const releaseYear = new Date().getUTCFullYear()
const nitroPreset = (process.env.NITRO_PRESET ?? '').replaceAll('_', '-')
const isCloudflarePagesBuild = process.env.CF_PAGES === '1'
  || nitroPreset === 'cloudflare-pages'
  || nitroPreset === 'cloudflare-pages-static'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-11',
  devtools: { enabled: false },
  ssr: true,
  telemetry: false,

  experimental: {
    prerenderErrorPages: [404],
  },

  modules: ['@nuxt/eslint'],

  css: [
    '~/assets/css/main.scss',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en', dir: 'ltr' },
      title: 'Reza Naserivand',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'Reza Naserivand' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl,
      releaseYear,
    },
  },

  nitro: {
    // Pages defaults to dist. Keep HTML, headers, redirects, and verification
    // together in the same artifact used by local builds and the Pages dashboard.
    output: isCloudflarePagesBuild
      ? { dir: '{{ rootDir }}/.output/public', publicDir: '{{ output.dir }}' }
      : undefined,
    // Nuxt 4.6.0 resolves this path with Windows separators, so Nitro's
    // string matcher can leave the SSR renderer external (nuxt/nuxt#36467).
    // The separator-agnostic matcher is a no-op on Linux and can be removed
    // after upgrading to a Nuxt release that includes the upstream fix.
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
    prerender: {
      crawlLinks: false,
      concurrency: 1,
      routes: ['/', '/projects', '/writing'],
    },
  },

  eslint: {
    config: {
      autoInit: false,
    },
  },
})
