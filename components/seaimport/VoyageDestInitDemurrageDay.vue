<template>
  <div>
    <v-card :color="darkMode.isDark ? 'cardBackground' : ''">
      <v-card-title>Voyage destination: {{ data.voyageDischarge?.name }}</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-4 gap-2">
          <v-card density="compact" color="blue-lighten-5">
            <v-card-text>
              <div v-if="hasVoyageDestDemurrageInitDay">
                <div class="text-overline mb-1">Demurrage init day</div>
                <div class="text-h6 mb-1">
                  {{ data.voyageDischarge?.init_demurrage_at }}
                </div>
              </div>
              <div v-if="!hasVoyageDestDemurrageInitDay">
                <div class="text-overline mb-1">Register demurrage init day</div>
                <div class="mb-1">
                  <v-text-field v-model="form.init_demurrage_at" type="date" density="compact" />
                </div>
                <v-btn color="primary" @click="registerDemurrageInitDay">Register</v-btn>
              </div>
            </v-card-text>
          </v-card>
          <v-card density="compact" color="blue-lighten-5">
            <v-card-text>
              <div class="text-overline mb-1">Line</div>
              <div class="text-h6 mb-1">
                {{ data.voyageDischarge?.voyage?.vessel?.line?.commercial_name }}
              </div>
              <div class="text-overline mb-1">Vessel</div>
              <div class="text-h6 mb-1">
                {{ data.voyageDischarge?.voyage?.vessel?.name }}
              </div>
            </v-card-text>
          </v-card>
          <v-card density="compact" color="blue-lighten-5">
            <v-card-text>
              <div class="text-overline mb-1">Import</div>
              <div class="text-overline mb-1">Port</div>
              <div class="text-h6 mb-1">
                {{ data.voyageDischarge?.pod?.country_port }}
              </div>
            </v-card-text>
          </v-card>
          <v-card density="compact" color="blue-lighten-5">
            <v-card-text>
              <div class="text-overline mb-1">ATA</div>
              <div class="text-h6 mb-1">
                {{ data.voyageDischarge?.arrival_date }}
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-card density="compact" color="blue-lighten-4" class="my-4">
          <v-card-title>Sea import references linked</v-card-title>
          <v-card-text>
            <p>Only references with Master BL linked to TM are option to initialize demurrages.</p>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold!"># Reference</th>
                  <th class="font-bold!">Consignee</th>
                  <th class="font-bold!">MBL(s)</th>
                  <th class="font-bold!">Container(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ref, index) in data.referencias" :key="`ref-${index}`">
                  <td>{{ ref.reference_number }}</td>
                  <td>{{ ref.consignee?.name }}</td>
                  <td>
                    <v-chip
                      v-for="(mbl, index) in ref.master_bls"
                      :key="`mbl-${index}`"
                      variant="outlined"
                      :color="getColorMbl(mbl)"
                      >{{ mbl.name }} {{ mbl.consignee_mbl?.name }}</v-chip
                    >
                  </td>

                  <td>
                    <div v-for="(container, index) in ref.containers" :key="`container-${index}`">
                      <v-chip v-if="container.demurrage == null" color="red" variant="outlined">{{
                        container.container_number
                      }}</v-chip>
                      <v-chip v-if="container.demurrage != null" color="green" variant="outlined"
                        >{{ container.container_number }} demurrages set</v-chip
                      >
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const darkMode = useDarkMode()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const form = ref({
  init_demurrage_at: '',
})

const data = ref<any>({
  referencias: [],
  voyageDischarge: {},
})

const getColorMbl = (mbl: any) => {
  if (mbl.consignee_mbl?.has_demurrages === 1) {
    return 'primary'
  }
  return 'red'
}

const hasVoyageDestDemurrageInitDay = computed(() => {
  return data.value.voyageDischarge?.init_demurrage_at != null
})

const getVoyageDestinationDetail = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.referencias.getByVoyageDestDemurrageInitDay(props.id)

    data.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const registerDemurrageInitDay = async () => {
  try {
    if (!form.value.init_demurrage_at) {
      snackbar.add({ type: 'error', text: 'Please select a date' })
      return
    }
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.voyages.registerDemurrageInitDay(props.id, form.value)

    snackbar.add({ type: 'success', text: 'Demurrage init day registered' })

    getVoyageDestinationDetail()
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

getVoyageDestinationDetail()
</script>
