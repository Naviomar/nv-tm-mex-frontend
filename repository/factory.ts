import { type $Fetch, type FetchOptions } from 'ofetch'

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

    const options: FetchOptions = {
      async onResponseError(context) {
        console.error('🚀 on Response Error', context.response?._data)
        apiErrorStore.addError(context.response)
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

    return this.$fetch<T>(url, {
      method,
      ...fetchOptions,
    })
  }
}

export default FetchFactory
