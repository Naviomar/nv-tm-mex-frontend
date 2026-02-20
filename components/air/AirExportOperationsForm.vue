<template>
  <div>
    <v-card>
      <v-tabs v-model="currentTab" bg-color="secondary" fixed-tabs slider-color="gold" show-arrows>
        <v-tab text="Details" prepend-icon="mdi-book-open-page-variant" value="1"></v-tab>
        <v-tab text="Print Master" prepend-icon="mdi-printer-pos-outline" value="2"> </v-tab>
        <v-tab text="Print House" prepend-icon="mdi-printer-pos-outline" value="3"> </v-tab>
        <v-tab text="Print Reservation" prepend-icon="mdi-printer-outline" value="4" :disabled="!isReservationEnabled">
        </v-tab>
        <v-tab text="Email Reservation" prepend-icon="mdi-email-outline" value="5" :disabled="!isReservationEnabled">
        </v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="currentTab">
          <v-window-item value="1">
            <AirExportEditForm :key="`edit-${refreshKey}`" :id="props.id" @reference-updated="handleReferenceUpdate" />
          </v-window-item>
          <v-window-item value="2">
            <AirExportPrintMasterAWB :key="`master-${refreshKey}`" :id="props.id" />
          </v-window-item>
          <v-window-item value="3">
            <AirExportPrintHouseAwbTab v-if="currentTab === '3'" :key="`house-${refreshKey}`" :id="props.id" />
          </v-window-item>
          <v-window-item value="4">
            <div v-if="!isReservationEnabled" class="text-center py-8">
              <div class="opacity-50 blur-sm mb-4">
                <v-icon size="80" color="grey">mdi-lock</v-icon>
              </div>
              <p class="text-lg text-grey">Only available for China Cargo and EVA airlines</p>
            </div>
            <AirExportPrintReservation
              v-else
              :id="props.id"
              :reference="referenceData"
              @refresh-data="fetchReferenceData"
            />
          </v-window-item>
          <v-window-item value="5">
            <div v-if="!isReservationEnabled" class="text-center py-8">
              <div class="opacity-50 blur-sm mb-4">
                <v-icon size="80" color="grey">mdi-lock</v-icon>
              </div>
              <p class="text-lg text-grey">Only available for China Cargo and EVA airlines</p>
            </div>
            <AirExportEmailReservation
              v-else
              :id="props.id"
              :reference="referenceData"
              @refresh-data="fetchReferenceData"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const currentTab = ref('1')
const referenceData = ref<any>(null)
const refreshKey = ref(0)

// Provide a refresh function for all child tabs
const refreshAllTabs = async () => {
  console.log('🔄 Refreshing all tabs data...')
  await fetchReferenceData()
  refreshKey.value++
  console.log('✅ All tabs refreshed. New key:', refreshKey.value)
}

provide('refreshAllTabs', refreshAllTabs)

// Check if airline_id is 27 (CHINA CARGO) or 30 (EVA)
const isReservationEnabled = computed(() => {
  if (!referenceData.value?.airline_id) return false
  return referenceData.value.airline_id === 27 || referenceData.value.airline_id === 30
})

const fetchReferenceData = async () => {
  try {
    loadingStore.start()
    const response = await $api.airExport.getReferenceById(props.id)
    referenceData.value = response
  } catch (error) {
    console.error('Error fetching reference data:', error)
  } finally {
    loadingStore.stop()
  }
}

const handleReferenceUpdate = (updatedReference: any) => {
  referenceData.value = updatedReference
}

onMounted(() => {
  fetchReferenceData()
})
</script>
