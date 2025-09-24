<template>
  <div>
    <SeaImportMovementDetail :referencia="referencia" />
    <CaptureTmInvoiceSeaImportCharges :referencia="referencia" />
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  reference_id: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>({})

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referencias.getSeaImportFullDetailById(props.reference_id)) as any

    referencia.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
