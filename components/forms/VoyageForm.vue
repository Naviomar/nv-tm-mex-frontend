<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2 md:col-span-1">
        <div class="mb-4">
          <InputAutocomplete
            name="vessel_id"
            density="compact"
            label="Select a vessel"
            :items="catalogs.vessels"
            item-value="id"
            :item-title="(row : any) => `${row.name} (${row.line?.commercial_name})`"
          />

          <v-btn density="compact" color="warning" size="small" to="/configuration/vessels/add">New vessel</v-btn>
        </div>
        <div>
          <InputText name="name" density="compact" label="Voyage" />
        </div>
        <div>
          <InputAutocomplete
            name="impoExpo"
            density="compact"
            label="Is import or export? *"
            :items="[
              { id: 'I', name: 'Import' },
              { id: 'E', name: 'Export' },
            ]"
            item-value="id"
            item-title="name"
            @update:model-value="clearDestinationProt"
          />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" @click="router.back"> Cancel </v-btn>
          <v-btn color="primary" @click="onVoyageClickSave"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-2 md:col-span-1">
        <v-card class="card2Background mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Origins (Export) - Destinations (Import)</div>
              <div>
                <v-btn icon size="x-small" @click="toggleDestForm" :color="showDestForm ? 'black' : 'success'">
                  <v-icon v-if="showDestForm">mdi-close</v-icon>
                  <v-icon v-if="!showDestForm">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="mb-4">Add at least one origin/destination</div>
            <div v-if="showDestForm" class="p-4 mb-4 grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <v-autocomplete
                  v-model="form.pod"
                  density="compact"
                  label="Port *"
                  :items="podPorts"
                  return-object
                  item-title="country_port"
                  hide-details
                  :custom-filter="customFilter"
                />
                <div class="italic text-sm">Select if Import or Export to show ports</div>
              </div>
              <div>
                <v-text-field v-model="form.eta_date" type="date" density="compact" label="ETA *" />
              </div>
              <div>
                <v-text-field v-model="form.arrival_date" type="date" density="compact" label="ATA" />
              </div>
              <div class="col-span-2">
                <div class="flex justify-center items-center">
                  <v-btn class="mr-4" color="secondary" @click="toggleDestForm"> Cancel </v-btn>
                  <v-btn color="primary" @click="addDestination"> Add </v-btn>
                </div>
              </div>
            </div>
            <div>Destination(s)</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Port</th>
                  <th class="text-left">ETA</th>
                  <th class="text-left">ATA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.destinations" :key="`voyage-dest-${index}`">
                  <td>
                    <div class="flex gap-2">
                      <div class="flex gap-2">
                        <v-btn
                          size="small"
                          variant="text"
                          icon="mdi-delete-outline"
                          color="red-lighten-2"
                          dense
                          @click="deleteDest(index)"
                        ></v-btn>
                      </div>
                    </div>
                  </td>
                  <td>{{ item.pod?.name }}</td>
                  <td>{{ item.eta_date }}</td>
                  <td>{{ item.arrival_date }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/voyageForm'
const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const catalogs = ref({
  vessels: [],
  ports: [],
})

const form = ref({
  pod: null,
  eta_date: null,
  arrival_date: null,
  destinations: [] as any[],
})

const showDestForm = ref(false)

const toggleDestForm = () => {
  showDestForm.value = !showDestForm.value
}

const deleteDest = (index: number) => {
  form.value.destinations.splice(index, 1)
}

const addDestination = () => {
  if (form.value.pod == null || form.value.eta_date == null) {
    snackbar.add({ type: 'warning', text: 'Complete required fields' })
    return
  }
  form.value.destinations.push({
    pod: form.value.pod,
    eta_date: form.value.eta_date,
    arrival_date: form.value.arrival_date,
  })
  form.value.pod = null
  form.value.eta_date = null
  form.value.arrival_date = null

  toggleDestForm()
}

const { handleSubmit, values, errors, setValues } = useForm({
  validationSchema: schema,
})

const getVoyageCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.voyages.getCatalogs()

    catalogs.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

/**
 * Custom filter function for Vuetify v-autocomplete.
 * Makes search case-insensitive and accent-insensitive.
 *
 * @param value - The filterable value from the item
 * @param search - The search input from the user
 * @param item - The full item object (not used in this case)
 * @returns true if the item matches the search, or false otherwise
 */
const customFilter = (value: string, search: string): boolean => {
  // Normalize the strings for case-insensitive and accent-insensitive matching
  const normalize = (str: string): string =>
    str
      .toLowerCase()
      .normalize('NFD') // Decomposes accented characters into base characters
      .replace(/[\u0300-\u036f]/g, '') // Removes the accent marks

  // Check if the normalized search query is included in the normalized value
  return normalize(value).includes(normalize(search))
}

const clearDestinationProt = () => {
  form.value.pod = null
}

const podPorts = computed(() => {
  if (!values.impoExpo) return []

  const importCountries = ['SV', 'AR', 'CR', 'PE', 'DO', 'NI', 'US', 'GT', 'HN', 'PA', 'MX']

  // if import only mexico ports
  if (values.impoExpo === 'I') {
    return catalogs.value.ports.filter((port: any) => importCountries.includes(port.country?.code))
  }
  // if export exclude mexico ports
  if (values.impoExpo === 'E') {
    return catalogs.value.ports.filter((port: any) => port.country?.code === 'MX')
  }

  return []
})

const validateForm = () => {
  if (form.value.destinations.length === 0) {
    snackbar.add({ type: 'warning', text: 'Add at least one origin/destination is required' })
    return false
  }
  return true
}

const onSuccess = async () => {
  try {
    const isValidForm = validateForm()
    if (!isValidForm) return

    loadingStore.loading = true
    const body = {
      ...values,
      destinations: [...form.value.destinations],
    }
    // body.destinations map pod to pod_id
    body.destinations = body.destinations.map((dest: any) => {
      return {
        pod_id: dest.pod.id,
        eta_date: dest.eta_date,
        arrival_date: dest.arrival_date,
      }
    })
    const response = await $api.voyages.create(body)
    snackbar.add({ type: 'success', text: 'Voyage created' })
    router.push('/configuration/voyages')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const onVoyageClickSave = handleSubmit(onSuccess, onInvalidSubmit)

onMounted(async () => {
  await getVoyageCatalogs()
  if (route.query.vessel_id) {
    setValues({ vessel_id: parseInt(route.query.vessel_id as string) })
  }
})
</script>
