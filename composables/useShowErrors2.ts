import type { FetchResponse, IFetchError } from 'ofetch'

export function useShowErrors2() {
  const snackbar = useSnackbar()
  const show = (fetchError: IFetchError<any>) => {
    if (import.meta.server) {
      return
    }
    if (!fetchError) {
      return
    }

    const responseData = fetchError.response?._data

    if (responseData.errors) {
      // console.log(responseData)
      // const { $notifications } = useNuxtApp()
      // const snackbar = $notifications.useSnackbar()

      // iterate over the errors and show them
      //   {
      //     "message": "These credentials do not match our records.",
      //     "errors": {
      //         "email": [
      //             "These credentials do not match our records."
      //         ]
      //     }
      // }
      Object.entries(responseData.errors).forEach(([key, value]: [string, any]) => {
        snackbar.add({
          type: 'error',
          text: value[0],
        })
      })
    }

    if (responseData.message) {
      snackbar.add({
        type: 'error',
        text: responseData.message,
      })
    }

    if (responseData?.responseMessage) {
      snackbar.add({
        type: 'error',
        text: responseData?.responseMessage,
      })
    }
  }

  return {
    show,
  }
}
