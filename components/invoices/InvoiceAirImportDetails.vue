<template>
  <div>
    <AirImportMovementDetail :airReference="airReference" />
    <AirReferenceRateDetail :airReference="airReference" />
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

const airReference = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airImport.getReferenceById(props.id)) as any

    airReference.value = response
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
