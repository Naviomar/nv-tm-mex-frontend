// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'
// import 'vuetify/styles'
import '@/assets/scss/vuetify-settings.scss'
import colors from 'vuetify/util/colors'
// import { colors as tmColors } from '@/plugins/00.colors'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { VDateInput } from 'vuetify/labs/VDateInput'


// const tmLightTheme: ThemeDefinition = {
//   dark: false,
//   colors: {
//     background: '#FFFFFF',
//     surface: '#FFFFFF',
//     primary: '#2A4F8C',
//     secondary: '#424656',
//     black: '#215732',
//     error: '#B00020',
//     info: '#2196F3',
//     success: '#4CAF50',
//     warning: '#FB8C00',
//     gray: '#F5F9FF',
//     yellow1: '#FFF7D6',
//     gold: '#8C672A',
//   },
// }

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      VDateInput,
    },
    theme: {
      themes: {
        light: {
          colors: {
            primary: '#2A4F8C',
            secondary: '#424656',
            background: '#FFFFFF',
            black: '#215732',
            error: '#B00020',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
            gray: '#F5F9FF',
            yellow1: '#FFF7D6',
            gold: '#8C672A',
          },
        },
        dark: {
          colors: {
            primary: '#009DFE',
            secondary: '#424656',
            background: '#080808',
            black: '#215732',
            error: '#CF6679',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
            gray: '#F5F9FF',
            yellow1: '#FFF7D6',
            gold: '#8C672A',
            cardBackground: '#1E1E1E',
            card2Background: '#2A2A2A',
          },
        },
      },
    },
    defaults: {
      VChip: {
        variant: 'elevated',
      },
      VCardTitle: {
        class: 'font-bold!',
        style: 'font-size: 1.1rem;',
      },
      VCardActions: {
        VBtn: { variant: 'elevated' },
      },
      VListGroup: {
        VListItem: {
          // style: 'padding-inline-start: calc(-26px + var(--indent-padding)) !important;',
          // class: 'submenu-ps-naviomar'
        },
      },
    },
  })

  app.vueApp.use(vuetify)
})
