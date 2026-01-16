import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
 
  devtools: {
    enabled: true,
 
    timeline: {
      enabled: true,
    },
  },
 
  experimental: {
    renderJsonPayloads: false,
  },
 
  css: [
    '~/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/scss/styles.scss',
  ],
 
  modules: [
    '@nuxt/content',
    'nuxt-auth-sanctum',
    'nuxt-lodash',
    'nuxt-meilisearch',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', ['defineStore', 'definePiniaStore']],
      },
    ],
    '@vee-validate/nuxt',
    'nuxt-snackbar',
    'nuxt-laravel-echo',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    }
  ],
 
  echo: {
    broadcaster: 'reverb',
    host: process.env.LARAVEL_ECHO_HOST, // Your Laravel Echo server
    port: process.env.LARAVEL_ECHO_PORT || 8080, // Your Laravel Echo port
    key: process.env.LARAVEL_ECHO_KEY, // Your Laravel Echo app key
    scheme: process.env.LARAVEL_ECHO_SCHEME || 'http',
    transports: ['ws', 'wss'],
    authentication: {
      baseUrl: process.env.API_URL, // Your Laravel app URL
    },
  },
 
  meilisearch: {
    instantSearch: true,
    hostUrl: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700', //required
    searchApiKey: process.env.MEILISEARCH_KEY || '', // required
    serverSideUsage: false
  },
 
  snackbar: {
    bottom: true,
    right: true,
    duration: 5000
  },
 
  lodash: {
    prefix: "_",
  },
 
  veeValidate: {
    autoImports: true,
  },
 
  sanctum: {
    baseUrl: process.env.API_URL || 'http://localhost:8000',
    endpoints: {
      csrf: '/sanctum/csrf-cookie',
      login: '/login',
      logout: '/logout',
      user: '/user',
    },
    client: {
      retry: false,
    },
    csrf: {
      cookie: 'XSRF-TOKEN',
      header: 'X-XSRF-TOKEN',
    },
    redirectIfUnauthenticated: true,
    redirect: {
      keepRequestedRoute: true,
      onLogin: '/', // Custom route after successful login
      onAuthOnly: '/system/auth/login',
      onGuestOnly: '/system/auth/login',
 
    },
    globalMiddleware: {
      enabled: true,
    },
    logLevel: 3,
  },
 
  imports: {
    presets: [
      {
        from: 'wangeditor',
        imports: ['Toolbar', 'Editor']
      }
    ]
  },
 
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
 
  app: {
    head: {
      title: process.env.APP_NAME || 'TMD Chile System',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'mask-icon', color: '#5bbad5', href: '/favicon/safari-pinned-tab.svg' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1' },
        { name: 'msapplication-TileColor', content: '#da532c' },
        { name: 'theme-color', content: '#ffffff' },
      ],
    },
  },
 
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:8000/api/v1',
      apiUrlCsrf: process.env.CSRF_API_URL || 'http://localhost:8000/sanctum/csrf-cookie',
      appName: process.env.APP_NAME || 'Naviomar System',
    },
  },
 
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
 
  build: {
    transpile: ['vuetify'],
  },
 
  vite: {
    ssr: {
      noExternal: ['moment-timezone']
    },
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['pusher-js'], // or ['nuxt-laravel-echo > pusher-js'] for newer Vite versions
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    define: {
      'process.env.DEBUG': false,
    },
  },
 
  devServer: {
    host: 'localhost',
    port: 3010, // o el puerto que quieras
    https: false,
  },
 
  compatibilityDate: '2024-08-31',
})