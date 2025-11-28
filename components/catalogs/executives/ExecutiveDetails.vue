<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Executive {{ item.name }}</div>
          </v-card-title>
          <v-card-text>
            <GenericDataRepresentation title="Executive" :data="item" />
            
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const item = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.executives.getById(props.id)
    item.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getData()
})
</script>
