<template>
  <div></div>
</template>
<script setup lang="ts">
const apiErrorStore = useApiErrorStore()
const snackbar = useSnackbar()

watch(
  () => apiErrorStore.errorStack,
  (errors) => {
    if (errors) {
      // for each response error in the stack, show a snackbar
      errors.forEach((error: any, i: number) => {
        let errorMsg = 'An error occurred'
        if (error?._data && error?._data?.message) {
          errorMsg = error._data.message
        }

        if (error?._data && error?._data?.responseMessage) {
          errorMsg = error._data.responseMessage
        }

        if (error?._data && error?._data?.errors) {
          Object.keys(error._data.errors).forEach((field) => {
            const fieldErrors = error._data.errors[field]
            fieldErrors.forEach((err: any) => {
              snackbar.add({
                type: 'error',
                text: err,
              })
            })
          })
        } else {
          snackbar.add({
            type: 'error',
            text: errorMsg,
          })
        }
      })
      // clear the error from the stack
      setTimeout(() => {
        apiErrorStore.clearErrors()
      }, 250)
    }
  },
  { immediate: true, deep: true }
)
</script>
