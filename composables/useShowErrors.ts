import type { FetchResponse, IFetchError } from 'ofetch'

export function useShowErrors(snackbar: any) {
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

      snackbar({
        text: responseData.message,
        showCloseButton: true,
        snackbarProps: {
          color: 'red',
          location: 'bottom',
        },
      })
    }

    if (responseData.message) {
      snackbar({
        text: responseData.message,
        showCloseButton: true,
        snackbarProps: {
          color: 'red',
          location: 'bottom',
        },
      })
    }

    if (responseData?.responseMessage) {
      snackbar({
        text: responseData?.responseMessage,
        showCloseButton: true,
        snackbarProps: {
          color: 'red',
          location: 'top',
        },
      })
    }
  }

  return {
    show,
  }
}
