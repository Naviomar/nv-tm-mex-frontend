<template>
  <div>
    <v-card>
      <v-card-title>
        <div class="flex items-center text-base gap-2">
          <v-icon size="x-small">mdi-ship-wheel</v-icon>
          <div>Sea Export information #{{ referencia.reference_number }}</div>
        </div>
      </v-card-title>
      <v-card-text>
        <v-card>
          <v-card-title>Ship sail status</v-card-title>
          <v-card-text>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <v-card density="compact" color="blue-lighten-5">
                <v-card-text>
                  <div class="text-overline mb-1">Line</div>
                  <div class="text-h6 mb-1">{{ referencia.voyage_discharge?.voyage?.vessel?.line?.name }}</div>
                  <div class="text-overline mb-1">Vessel</div>
                  <div class="text-h6 mb-1">{{ referencia.voyage_discharge?.voyage?.vessel?.name }}</div>

                  <div>
                    <div v-if="hasSailed">
                      <v-chip size="x-large" color="green-darken-4"><v-icon>mdi-sail-boat</v-icon>Ship sailed</v-chip>
                      <v-alert
                        density="compact"
                        variant="outlined"
                        color="success"
                        icon="mdi-check"
                        border-color="success"
                      >
                        <div>Last updated by {{ referencia.voyage_discharge?.sailed_user?.name }}</div>
                        <div>@ {{ formatDateString(referencia.voyage_discharge?.sailed_at) }}</div>
                      </v-alert>
                    </div>
                    <div v-if="!hasSailed">
                      <v-chip size="x-large" color="red-darken-4"><v-icon>mdi-sail-boat</v-icon>Ship not sailed</v-chip>
                      <v-alert
                        density="compact"
                        variant="outlined"
                        color="warning"
                        icon="mdi-close"
                        border-color="success"
                      >
                        <div>Last updated by {{ referencia.voyage_discharge?.sailed_user?.name }}</div>
                        <div>@ {{ formatDateString(referencia.voyage_discharge?.sailed_at) }}</div>
                      </v-alert>
                    </div>

                    <div class="py-4">
                      <v-btn @click="onClickToggleSailed" color="primary" class="ml-2" size="small">
                        {{ btnLabelSail }}
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <v-card density="compact" color="blue-lighten-5">
                <v-card-text>
                  <div class="text-overline mb-1">Export</div>
                  <div class="text-overline mb-1">POL</div>
                  <div class="text-h6 mb-1">{{ referencia.voyage_discharge?.pod?.country_port }}</div>
                  <div class="text-overline mb-1">ETA</div>
                  <div class="text-h6 mb-1">{{ formatDateOnlyString(referencia.voyage_discharge?.eta_date) }}</div>
                  <div class="text-overline mb-1">ATD</div>
                  <div class="text-h6 mb-1">{{ referencia.voyage_discharge?.arrival_date || 'TBC' }}</div>
                </v-card-text>
              </v-card>
              <v-card density="compact" color="blue-lighten-5">
                <v-card-text>
                  <v-btn color="secondary" size="small" @click="goToUpdateEta">
                    <v-icon class="mr-2">mdi-open-in-new</v-icon> Update ETA
                  </v-btn>

                  <div v-if="isPendingSyncToCl" class="mt-4">
                    <v-alert density="compact" variant="flat" color="purple" icon="mdi-sync" border-color="warning">
                      <div class="mb-2">This reference is pending to be synchronized with CL.</div>
                      <v-btn color="purple-lighten-2" variant="flat" size="small" @click="onClickSyncToCl">
                        <v-icon class="mr-2">mdi-sync</v-icon> Sync to CL
                      </v-btn>
                    </v-alert>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <div class="grid grid-cols-1 gap-2">
              <div class="text-overline">Linked References</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!">Reference #</th>
                    <th class="font-bold!">Created at</th>
                    <th class="font-bold!">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ref in referencia.voyage_discharge?.referencias" :key="ref.id">
                    <td>{{ ref.reference_number }}</td>
                    <td>{{ formatDateString(ref.created_at) }}</td>
                    <td>
                      <v-btn
                        v-if="!isSameAsRoute(ref.id)"
                        size="small"
                        variant="text"
                        icon="mdi-eye-outline"
                        color="blue-lighten-2"
                        dense
                        :to="`/maritime/export/${ref.id}`"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const referencia = ref<any>({})
const form = reactive({
  new_eta_date: '',
})

const hasSailed = computed(() => {
  return referencia.value.voyage_discharge?.is_sailed === 1
})

const btnLabelSail = computed(() => {
  return hasSailed.value ? 'Mark as not sailed' : 'Mark as sailed'
})

const isPendingSyncToCl = computed(() => {
  return referencia.value.referencia_cl == null && referencia.value.pod?.country_id == 44
})

const isSameAsRoute = (id: number) => {
  return id === props.id
}

const onClickToggleSailed = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.toggleSailed(props.id.toString())) as any
    snackbar.add({ type: 'success', text: 'Process completed.' })
    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const goToUpdateEta = () => {
  router.push(`/configuration/voyages/destination-${referencia.value.voyage_discharge.id}/update-eta`)
}

const onClickUpdateEta = async () => {
  try {
    loadingStore.start()
    const body = {
      new_eta_date: form.new_eta_date,
    }

    await $api.voyages.updateDestinationEtaById(referencia.value.voyage_discharge.id, body)
    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickSyncToCl = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.syncToCl(props.id.toString())) as any
    snackbar.add({ type: 'success', text: 'Process completed.' })
    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaExportDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.getVoyageDestinationZarpe(props.id.toString())) as any
    referencia.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getSeaExportDetails()
})
</script>
