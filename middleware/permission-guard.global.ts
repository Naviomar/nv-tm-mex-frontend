import { permissionForPath } from '~/utils/data/routePermissions'

/**
 * Sends the user to /no-access when they open an action page (add, edit, detail) they lack
 * the permission for, instead of letting them fill in a form the API will reject. Rules live
 * in utils/data/routePermissions.ts. Pages without a rule are unaffected.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/no-access') return

  const required = permissionForPath(to.path)
  if (!required) return

  const { user, can } = useCheckUser()
  // Not signed in (or identity not loaded yet): the sanctum middleware decides.
  if (!user.value) return

  if (!can(required)) {
    return navigateTo({ path: '/no-access', query: { from: to.fullPath } }, { replace: true })
  }
})
