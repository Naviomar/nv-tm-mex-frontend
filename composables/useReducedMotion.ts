/**
 * Preferencia persistida para ocultar la animación de puntos del globo
 * (pedido por accesibilidad: usuarios con tripofobia). Usa useState para
 * que el mismo valor reactivo se comparta entre el botón del footer y
 * AuthGlobeBackground.vue sin pasar props.
 */
export function useReducedMotion() {
  const hideGlobeMotion = useState('hideGlobeMotion', () => false)

  onMounted(() => {
    const stored = localStorage.getItem('hideGlobeMotion')
    hideGlobeMotion.value = stored === 'true'
  })

  function toggleGlobeMotion() {
    hideGlobeMotion.value = !hideGlobeMotion.value
    localStorage.setItem('hideGlobeMotion', String(hideGlobeMotion.value))
  }

  return { hideGlobeMotion, toggleGlobeMotion }
}
