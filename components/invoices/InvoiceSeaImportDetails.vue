<template>
  <div>
    <SeaImportMovementDetail :referencia="referencia" />
    <SeaImportRateDetail :referencia="referencia" />
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getSeaImportFullDetailById(props.id)) as any

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
