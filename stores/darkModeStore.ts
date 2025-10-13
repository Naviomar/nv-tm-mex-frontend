import { useTheme } from 'vuetify'

export const useDarkMode = defineStore('darkMode', () => {
  const theme = useTheme()
  const isDark = ref(false)

  // Toggle theme and store the preference
  function toggleTheme() {
    isDark.value = !isDark.value
    theme.global.name.value = isDark.value ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('darkMode', isDark.value.toString()) // Persist the theme
  }

  watch(theme.global.current, (value) => {
    isDark.value = value.dark
  })

  // Initialize the theme on store creation
  onMounted(() => {
    const storedTheme = localStorage.getItem('darkMode')
    if (storedTheme) {
      isDark.value = storedTheme === 'true'
      theme.global.name.value = isDark.value ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  })

  return {
    isDark,
    toggleTheme,
  }
})
