import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: {
    enabled: process.env.NODE_ENV !== 'production',

    timeline: {
      enabled: true,
    },
  },

  experimental: {
    renderJsonPayloads: false,
    checkOutdatedBuildInterval: 40000 * 10
  },

  css: [
    '~/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.min.css',
    // 'vuetify/lib/styles/main.sass',
    '~/assets/scss/styles.scss',
    '~/assets/css/wiki-prose.css',
  ],

  modules: [
    '@nuxt/content',
    'nuxt-auth-sanctum',
    'nuxt-lodash',
    'nuxt-meilisearch',
    // '@vite-pwa/nuxt',
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
        config.plugins.push(vuetify({
          autoImport: true
        }))
      })
    },
  ],

  pwa: {
    registerType: 'autoUpdate', // Detecta actualizaciones automáticas
    workbox: {
      clientsClaim: true, // Asegura que los nuevos SW se activen de inmediato
      skipWaiting: true,  // Obliga a que la nueva versión se use de inmediato
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//], // Ignore API routes
    },
    manifest: {
      name: process.env.APP_NAME || 'TM System',
      short_name: 'Naviomar',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/tm-logo-black.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/tm-logo-black.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },

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
    logLevel: 0,
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
      title: process.env.APP_NAME || 'TM System',
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
      apiUrlChile: process.env.CHILE_API_URL || 'http://localhost:8000/api/v1',
      appName: process.env.APP_NAME || 'TM System',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
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
    }
  },


  compatibilityDate: '2024-07-08',
})