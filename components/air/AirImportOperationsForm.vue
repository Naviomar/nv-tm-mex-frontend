<template>
  <div>
    <CancelledReferenceBanner :deleted-at="referenceData?.deleted_at" :reference-number="referenceData?.reference_number" />
    <v-card>
      <v-tabs v-model="currentTab" bg-color="secondary" class="tabs1" fixed-tabs slider-color="gold" show-arrows>
        <v-tab text="Details" prepend-icon="mdi-book-open-page-variant" value="1" :disabled="isCancelled"></v-tab>
        <v-tab text="Notification" prepend-icon="mdi-send-variant-outline" value="2" :disabled="isCancelled"> </v-tab>
        <v-tab text="Cancel" prepend-icon="mdi-delete-outline" value="3"> </v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="currentTab">
          <v-window-item value="1">
            <AirImportEditForm :id="props.id" />
          </v-window-item>
          <v-window-item value="2">
            <AirImportNotify :id="props.id" />
          </v-window-item>
          <v-window-item value="3">
            <AirImportDeleteForm :id="props.id" serviceType="air-import" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const currentTab = ref('1')
const referenceData = ref<any>(null)

const isCancelled = computed(() => !!referenceData.value?.deleted_at)

const fetchReference = async () => {
  try {
    const response = (await $api.airImport.getReferenceById(props.id)) as any
    referenceData.value = response
    if (isCancelled.value) {
      currentTab.value = '3'
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchReference()
})
</script>
