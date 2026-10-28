// Every API call carries the user being viewed (if any). The backend validates it against the real session.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('sanctum:request', (_app: any, context: any) => {
    const id = readViewAsId()
    if (!id) return
    const headers = new Headers(context.options.headers)
    headers.set('X-View-As', String(id))
    context.options.headers = headers
  })

  // A page rendered on the server (or restored from cache) knows nothing about this tab's view: load the viewed user's identity.
  nuxtApp.hook('app:mounted', async () => {
    if (!readViewAsId()) return
    await nuxtApp.runWithContext(async () => {
      const { user, refreshIdentity } = useSanctumAuth()
      if (!(user.value as any)?.view_as) await refreshIdentity()
    })
  })

  // The chosen user can no longer be viewed (deactivated, role changed): go back to the real session.
  nuxtApp.hook('sanctum:error:response', (context: any) => {
    const code = context?.response?._data?.code
    if (code === 'view_as_target_invalid' || code === 'view_as_forbidden') {
      try {
        sessionStorage.removeItem('nv-tm:view-as')
      } catch {
        // no-op
      }
      window.location.reload()
    }
  })
})
