<template>
  <v-container fluid>
    <div>
      <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-4">Back</v-btn>
    </div>
    <div>
      <AirExportMovementDetail :airReference="airReference" />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

definePageMeta({
  title: 'Air Export Ref - TM',
  layout: 'default',
})

const route = useRoute()
const id = route.params.id!.toString()

const airReference = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airExport.getReferenceById(id)) as any

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
