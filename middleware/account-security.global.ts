import { pendingSecurityRequirement, SECURITY_REQUIRED_ROUTE } from '~/utils/security/loginEvents'

/**
 * Mientras el usuario tenga pendiente el cambio de contraseña o configurar el doble factor exigido,
 * solo puede estar en la pantalla que lo resuelve. El backend bloquea igual las llamadas a la API;
 * esto evita mostrarle pantallas que no van a cargar.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useSanctumAuth()
  if (!user.value) return

  const pending = pendingSecurityRequirement(user.value)
  const allowed = to.path === SECURITY_REQUIRED_ROUTE || to.path === '/logout' || to.path.startsWith('/system/auth/')

  if (pending && !allowed) {
    return navigateTo(SECURITY_REQUIRED_ROUTE, { replace: true })
  }

  if (!pending && to.path === SECURITY_REQUIRED_ROUTE) {
    return navigateTo('/', { replace: true })
  }
})
