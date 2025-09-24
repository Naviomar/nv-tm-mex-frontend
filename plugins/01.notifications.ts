import {
  type ConfirmDialogKeyValue,
  type ConfirmDialogOptions,
  type SnackbarOptions,
  mount,
} from '@/utils/notifications'
import { nanoid } from 'nanoid'
import { useTheme } from 'vuetify'
import ConfirmDialog from '@/components/global/ConfirmDialog.vue'
import Snackbar from '@/components/global/Snackbar.vue'

interface GlobalOptions {
  confirmDialog: ConfirmDialogOptions
  snackbar: SnackbarOptions
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export default defineNuxtPlugin((nuxtApp) => {
  const state = reactive<ConfirmDialogKeyValue['state']>({ promiseIds: new Map() })

  function mountDialog(options: ConfirmDialogOptions) {
    const promiseId = nanoid()

    mount(
      ConfirmDialog,
      {
        ...{},
        ...options,
        promiseId,
      },
      nuxtApp.vueApp
    )

    return new Promise((resolve, reject) => {
      state.promiseIds.set(promiseId, {
        resolve,
        reject,
      })
    })
  }

  function mountSnackbar(options: SnackbarOptions) {
    mount(
      Snackbar,
      {
        ...{},
        ...options,
      },
      nuxtApp.vueApp
    )
  }

  nuxtApp.vueApp.config.globalProperties.$confirm = (options: WithRequired<ConfirmDialogOptions, 'theme'>) => {
    return mountDialog(options)
  }

  nuxtApp.vueApp.config.globalProperties.$toast = (options: WithRequired<SnackbarOptions, 'theme'>) => {
    return mountSnackbar(options)
  }

  nuxtApp.vueApp.provide('ConfirmDialogKey', {
    mountDialog,
    mountSnackbar,
    state,
  })

  function useConfirm() {
    const dialog = inject('ConfirmDialogKey') as ConfirmDialogKeyValue
    // const theme = useTheme()

    function confirm(options: ConfirmDialogOptions) {
      if (!dialog) throw new Error('Missing dialog instance')

      return dialog.mountDialog({
        theme: 'current',
        ...options,
      })
    }

    return confirm
  }

  // function useSnackbar() {
  //   const dialog = inject('ConfirmDialogKey') as ConfirmDialogKeyValue

  //   // const theme = useTheme()

  //   function toast(options: SnackbarOptions) {
  //     if (!dialog) throw new Error('Missing dialog instance')

  //     return dialog.mountSnackbar({
  //       theme: 'current', // theme.name.value,
  //       ...options,
  //     })
  //   }

  //   return toast
  // }

  return {
    provide: {
      notifications: { useConfirm },
    },
  }
})
