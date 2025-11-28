export default defineNuxtPlugin((nuxtApp) => {

    const colors = {
        primary: '#1976d2',
        secondary: '#424242',
        accent: '#82b1ff',
        backgroundLight: '#ffffff',
        backgroundDark: '#121212',
        cardBackground: '#1E1E1E'
    }

    nuxtApp.vueApp.config.globalProperties.$colors = colors
})
