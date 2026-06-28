<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="">
        <!-- Unified edit form -->
        <v-card density="compact" class="mb-4">
          <v-card-text>
            <v-alert v-if="voyageHasReferences" type="warning" density="compact" class="mb-4">
              This voyage has {{ totalVoyageReferences }} reference(s) linked. Vessel, Import/Export, and port cannot be changed.
            </v-alert>

            <!-- Voyage fields -->
            <div class="text-subtitle-2 font-bold mb-2">Voyage</div>
            <div class="mb-4">
              <InputAutocomplete
                name="vessel_id"
                density="compact"
                label="Vessel"
                :items="catalogs.vessels"
                item-value="id"
                :item-title="(row : any) => `${row.line?.name} - ${row.name}`"
                :readonly="voyageHasReferences"
                :append-inner-icon="voyageHasReferences ? 'mdi-lock' : undefined"
              />
            </div>
            <div class="mb-4">
              <InputText name="name" density="compact" label="Voyage" />
            </div>
            <div class="mb-4">
              <InputText name="internal_code" density="compact" label="Internal code" />
            </div>
            <div class="mb-4">
              <InputAutocomplete
                name="impoExpo"
                density="compact"
                label="Import / Export"
                :items="[
                  { id: 'I', name: 'Import' },
                  { id: 'E', name: 'Export' },
                ]"
                item-value="id"
                item-title="name"
                :readonly="voyageHasReferences"
                :append-inner-icon="voyageHasReferences ? 'mdi-lock' : undefined"
              />
            </div>

            <v-divider class="my-4" />

            <!-- Destination fields -->
            <div class="text-subtitle-2 font-bold mb-2">Destination</div>
            <div class="mb-4">
              <InputAutocomplete
                name="pod_id"
                density="compact"
                label="Port"
                :items="podPorts"
                item-value="id"
                item-title="country_port"
                :readonly="values.locked_at || voyageHasReferences"
                :append-inner-icon="(values.locked_at || voyageHasReferences) ? 'mdi-lock' : undefined"
              />
            </div>
            <div class="mb-4">
              <InputText name="eta_date" type="date" density="compact" :label="labelEtaDate" :readonly="values.locked_at" :append-inner-icon="values.locked_at ? 'mdi-lock' : undefined" />
            </div>
            <div class="mb-4">
              <InputText name="arrival_date" type="date" density="compact" :label="labelAtaDate" />
            </div>

            <v-alert v-if="isImport && !hasInitDemurrages" type="warning" density="compact">
              When registering the ATA of the destination and being an import, the demurrage process will begin to linked
              services since it is an import destination.
            </v-alert>

            <v-alert v-if="isImport && hasInitDemurrages" type="info" density="compact">
              This destination has already started the demurrage process, you can no longer update the destination. All
              services and new services linked to this destination will be demurraged.
            </v-alert>

            <div class="flex justify-center items-center gap-2 py-4">
              <v-btn class="mr-4" color="secondary" @click="goToVoyages"> Cancel </v-btn>
              <v-btn color="primary" :disabled="loadingStore.loading" :loading="loadingStore.loading" @click="onUnifiedUpdate"> Update </v-btn>
              <div v-if="values.locked_at" class="text-red-500">This destination is locked</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="">
        <v-card density="compact" class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Voyage {{ data.voyage?.name }} details</div>
              <div>
                <v-btn icon size="x-small" @click="toggleDestForm" :color="showDestForm ? 'black' : 'success'">
                  <v-icon v-if="showDestForm">mdi-close</v-icon>
                  <v-icon v-if="!showDestForm">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2 font-bold mb-4">
              <div>Vessel:</div>
              <div>{{ data.voyage?.vessel?.name }}</div>
              <div>Voyage:</div>
              <div>{{ data.voyage?.name }}</div>
              <div>Import / Export:</div>
              <div>{{ data.voyage?.impoExpo }}</div>
            </div>
            <div v-if="showDestForm" class="bg-white p-4 mb-4 grid grid-cols-2 gap-2">
              <div>
                <v-autocomplete
                  v-model="form.pod_id"
                  density="compact"
                  label="Port *"
                  :items="podPorts"
                  item-title="country_port"
                  item-value="id"
                />
              </div>
              <div>
                <v-text-field v-model="form.eta_date" type="date" density="compact" :label="labelEtaDate" />
              </div>
              <div>
                <v-text-field v-model="form.arrival_date" type="date" density="compact" :label="labelAtaDate" />
              </div>
              <div class="col-span-2">
                <div class="flex justify-center items-center">
                  <v-btn class="mr-4" color="secondary" @click="toggleDestForm"> Cancel </v-btn>
                  <v-btn color="primary" @click="addDestination"> Add destination to voyage </v-btn>
                </div>
              </div>
            </div>
            <div class="font-bold">Destination(s)</div>
            <div class="flex pt-2">
              <div class="w-5 h-5 bg-green-lighten-4"></div>
              <div class="ml-2 font-italic">You are updating this destination</div>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="" width="20"></th>
                  <th class="font-bold!">Port</th>
                  <th class="font-bold!">{{ labelEtaDate }}</th>
                  <th class="font-bold!">{{ labelAtaDate }}</th>
                  <th class="font-bold!">Refs</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in data.voyage?.destinations"
                  :key="`voyage-dest-${index}`"
                  :class="sameDestColor(item)"
                >
                  <td>
                    <v-icon v-if="!item.locked_at" size="small" color="green">mdi-lock-open-variant</v-icon>
                    <div v-if="item.locked_at">
                      <v-tooltip :text="item.locked_at">
                        <template v-slot:activator="{ props }">
                          <v-icon size="small" color="red" v-bind="props">mdi-lock-outline</v-icon>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                  <td>{{ item.pod?.name }} - {{ item.pod?.country?.name }}</td>
                  <td>{{ formatDateOnlyString(item.eta_date) }}</td>
                  <td>{{ item.arrival_date }}</td>
                  <td>{{ item.referencias?.length || item.total_references || 0 }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <VoyageNotesForm v-if="data.voyage" :voyage="data.voyage" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaVoyageDestinationEdit } from '~~/forms/voyageForm'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const id = route.params.id

const { values, resetForm } = useForm({
  validationSchema: schemaVoyageDestinationEdit,
})

const data = ref({
  voyage: null as any,
  destination: null as any,
})

const catalogs = ref({
  ports: [] as any,
  vessels: [] as any,
  lines: [] as any,
})

const form = ref({
  pod_id: null,
  eta_date: null,
  arrival_date: null,
  destinations: [] as any[],
})

const showDestForm = ref(false)

const toggleDestForm = () => {
  showDestForm.value = !showDestForm.value
}

const goToVoyages = () => {
  router.push('/configuration/voyages')
}

const addDestination = async () => {
  if (form.value.pod_id == null) {
    snackbar.add({ type: 'error', text: 'Complete required fields' })
    return
  }
  try {
    loadingStore.start()
    const body = { ...form.value } as any
    body.voyage_id = data.value.voyage?.id
    await $api.voyages.addDestinationToVoyageId(data.value.voyage?.id.toString(), body)
    form.value.pod_id = null
    form.value.eta_date = null
    form.value.arrival_date = null

    toggleDestForm()
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const labelEtaDate = computed(() => {
  if (data.value.voyage?.impoExpo === 'I') return 'ETA'
  return 'ETD'
})

const labelAtaDate = computed(() => {
  if (data.value.voyage?.impoExpo === 'I') return 'ATA'
  return 'ATD'
})

const isImport = computed(() => {
  return data.value.voyage?.impoExpo === 'I'
})

const hasInitDemurrages = computed(() => {
  return data.value.destination?.init_demurrage_at != null
})

const voyageHasReferences = computed(() => {
  const destinations = data.value.voyage?.destinations ?? []
  return destinations.some((d: any) => (d.referencias?.length ?? d.total_references ?? 0) > 0)
})

const totalVoyageReferences = computed(() => {
  const destinations = data.value.voyage?.destinations ?? []
  return destinations.reduce((sum: number, d: any) => sum + (d.referencias?.length ?? d.total_references ?? 0), 0)
})

const podPorts = computed(() => {
  if (!data.value.voyage?.impoExpo) return []

  const importCountries = ['SV', 'AR', 'CR', 'PE', 'DO', 'NI', 'US', 'GT', 'HN', 'PA', 'MX']

  // if import only mexico ports
  if (data.value.voyage?.impoExpo === 'I') {
    return catalogs.value.ports.filter((port: any) => importCountries.includes(port.country?.code))
  }
  // if export exclude mexico ports
  if (data.value.voyage?.impoExpo === 'E') {
    return catalogs.value.ports.filter((port: any) => port.country?.code === 'MX')
  }

  return []
})

const onUnifiedUpdate = async () => {
  try {
    loadingStore.start()

    const voyageBody = {
      name: values.name,
      vessel_id: values.vessel_id,
      internal_code: values.internal_code ?? null,
      impoExpo: values.impoExpo,
    }
    await $api.voyages.update(data.value.voyage?.id.toString(), voyageBody)

    const destValues = {
      pod_id: values.pod_id,
      eta_date: values.eta_date,
      arrival_date: values.arrival_date,
    } as any
    if (data.value.destination.locked_at) {
      await $api.voyages.updateDestinationWithPermission(id!.toString(), destValues)
    } else {
      await $api.voyages.updateDestination(id!.toString(), destValues)
    }

    snackbar.add({ type: 'success', text: 'Voyage & destination updated' })
    await getData()
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Error updating'
    snackbar.add({ type: 'error', text: msg })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const sameDestColor = (dest: any) => {
  if (dest.id === data.value.destination.id) {
    return 'bg-green-lighten-4'
  }
  return ''
}

const getVoyageCatalogs = async () => {
  const response = await $api.voyages.getCatalogs()

  catalogs.value = response as any
}

const getData = async () => {
  const response = await $api.voyages.getDestinationDetailsById(route.params.id!.toString())
  data.value = response as any
  data.value.destination.pod_id = catalogs.value.ports.find((c: any) => c.id === data.value.destination?.pod_id).id

  resetForm({
    values: {
      name: data.value.voyage?.name,
      vessel_id: data.value.voyage?.vessel_id,
      internal_code: data.value.voyage?.internal_code ?? null,
      impoExpo: data.value.voyage?.impoExpo,
      pod_id: data.value.destination?.pod_id,
      eta_date: data.value.destination?.eta_date,
      arrival_date: data.value.destination?.arrival_date,
      locked_at: data.value.destination?.locked_at,
    } as any,
  })
}

await getVoyageCatalogs()
await getData()
</script>
