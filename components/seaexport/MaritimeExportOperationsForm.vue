<template>
  <div>
    <CancelledReferenceBanner :deleted-at="referenceData?.deleted_at" :reference-number="referenceData?.reference_number" />
    <v-card>
      <v-tabs
        v-model="currentTab"
        bg-color="secondary"
        class="tabs1"
        fixed-tabs
        slider-color="gold"
        show-arrows
        @update:model-value="onTabChange"
      >
        <v-tab text="Details" prepend-icon="mdi-book-open-page-variant" value="1" :disabled="isCancelled"></v-tab>
        <v-tab text="Bkg confirmation" prepend-icon="mdi-ticket-confirmation-outline" value="2" :disabled="isCancelled"> </v-tab>
        <v-tab text="Release" prepend-icon="mdi-receipt-text-send-outline" value="3" :disabled="isCancelled"> </v-tab>
        <v-tab text="Print BL" prepend-icon="mdi-printer-outline" value="4" :disabled="isCancelled"> </v-tab>
        <v-tab text="Ship sail check" prepend-icon="mdi-ferry" value="5" :disabled="isCancelled"> </v-tab>
        <v-tab text="Alerts" prepend-icon="mdi-bell-alert-outline" value="6" :disabled="isCancelled"> </v-tab>
        <v-tab text="Detentions" prepend-icon="mdi-timer-alert-outline" value="7" :disabled="isCancelled"> </v-tab>
        <v-tab text="Cancel" prepend-icon="mdi-delete-outline" value="8"> </v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="currentTab">
          <v-window-item value="1">
            <MaritimeExportEditForm v-if="currentTab === '1'" :id="props.id.toString()" />
          </v-window-item>
          <v-window-item value="2">
            <SeaExportBookingConfirmation :id="props.id" />
          </v-window-item>
          <v-window-item value="3">
            <SeaExportRelease :id="props.id" />
          </v-window-item>
          <v-window-item value="4">
            <SeaExportPrintBL v-if="currentTab === '4'" :id="props.id" ref="seaExportPrintBl" />
          </v-window-item>
          <v-window-item value="5">
            <SeaExportShipSailCheck :id="props.id" />
          </v-window-item>
          <v-window-item value="6">
            <SeaExportMBLAlerts v-if="currentTab === '6'" :id="props.id" />
          </v-window-item>
          <v-window-item value="7">
            <SeaExportDetentions :id="props.id" />
          </v-window-item>
          <v-window-item value="8">
            <SeaExportDeleteForm :id="props.id" serviceType="sea-export" />
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
    type: Number,
    required: true,
  },
})

const currentTab = ref('1')
const referenceData = ref<any>(null)

const isCancelled = computed(() => !!referenceData.value?.deleted_at)

const seaExportPrintBl = ref<any>(null)

const onTabChange = (newTab: any) => {
  if (seaExportPrintBl.value && newTab === '4') {
    seaExportPrintBl.value.getSeaExportDetails
  }
}

const fetchReference = async () => {
  try {
    const response = (await $api.referenciasExport.getReferenciaById(props.id.toString())) as any
    referenceData.value = response
    if (isCancelled.value) {
      currentTab.value = '8'
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchReference()
})
</script>
