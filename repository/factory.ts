import { type $Fetch, type FetchOptions } from 'ofetch'
import { SECURITY_REQUIRED_CODES, SECURITY_REQUIRED_ROUTE } from '~/utils/security/loginEvents'

/*
 The FetchFactory acts as a wrapper around an HTTP client. 
 It encapsulates the functionality for making API requests asynchronously 
 through the call function, utilizing the provided HTTP client.
*/
class FetchFactory<T> {
  private $fetch: $Fetch

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher
  }

  /**
   * The HTTP client is utilized to control the process of making API requests.
   * @param method the HTTP method (GET, POST, ...)
   * @param url the endpoint url
   * @param fetchOptions fetch options
   * @returns
   */
  async call(method: string, url: string, fetchOptions?: FetchOptions<any>): Promise<T> {
    const nuxtApp = useNuxtApp();
    const sanctumOptions = useSanctumConfig();
    const apiErrorStore = useApiErrorStore();

    // Registra la llamada para el drawer "Page permissions" (qué rutas de
    // API usa realmente la vista activa).
    if (import.meta.client) {
      try {
        usePageApiCallsStore().record(method, url, useRoute().path)
      } catch (e) {
        // no-op: nunca debe romper una llamada real por esto
      }
    }

    const options: FetchOptions = {
      async onResponseError(context) {
        console.error('🚀 on Response Error', context.response?._data)
        // Silent saves (screen preferences) hit the read-only wall while viewing as another user: nothing to tell.
        const silentViewAs = context.response?._data?.code === 'view_as_read_only' && String(context.request).includes('ui-preferences')
        // Pending password change / 2FA setup: every screen call answers 403 until it's resolved; send the
        // user to the screen that resolves it instead of stacking error messages.
        const securityRequired = SECURITY_REQUIRED_CODES.includes(context.response?._data?.code)
        if (securityRequired && import.meta.client) {
          await nuxtApp.runWithContext(() => navigateTo(SECURITY_REQUIRED_ROUTE, { replace: true }))
        }
        if (!silentViewAs && !securityRequired) apiErrorStore.addError(context.response)
        // console.error('onResponseError', context)
        if (context.response.status === 401) {
          console.warn('🚀 401', context.response)
          if (import.meta.client) {
            await nuxtApp.runWithContext(() =>
              navigateTo(sanctumOptions.redirect.onAuthOnly as string)
            );
          }
          // auth.logout()
        }
      },
    }

    // Merge the default options with the provided options
    fetchOptions = {
      ...options,
      ...fetchOptions,
    }

    // Tell the API which screen fired the call, so a rejected action (403) can be traced back
    // to the interface that offered it (see app-mex:report-permission-denials).
    const headers = new Headers(fetchOptions?.headers as HeadersInit | undefined)
    if (import.meta.client && !headers.has('X-UI-Route')) {
      try {
        const route = useRoute()
        headers.set('X-UI-Route', (route.matched.at(-1)?.path || route.path).slice(0, 190))
      } catch (e) {
        // no-op: never break a real call over diagnostics
      }
    }

    return this.$fetch<T>(url, {
      method,
      ...fetchOptions,
      headers,
    })
  }
}

export default FetchFactory
