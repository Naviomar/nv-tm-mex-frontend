<template>
  <div>
    <v-btn size="small" color="primary" @click="showFrom = true"> Add destination </v-btn>
    <v-dialog v-model="showFrom" max-width="600">
      <v-card>
        <v-card-title> Add destination to voyage </v-card-title>
        <v-card-text>
          <AGlobalSearch
            :onSearch="searchPorts"
            v-model="form.pod_id"
            prepend-inner-icon="mdi-ferry"
            :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
            label="Port *"
          />
          <div>
            <v-text-field v-model="form.eta_date" type="date" density="compact" :label="labelEtaDate" />
          </div>
          <div>
            <v-text-field v-model="form.arrival_date" type="date" density="compact" :label="labelAtaDate" />
          </div>
          <div class="col-span-2">
            <div class="flex gap-2 justify-center items-center">
              <v-btn size="small" color="secondary" @click="cancelForm"> Cancel </v-btn>
              <v-btn size="small" color="primary" @click="addDestination"> Add destination to voyage </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const form = reactive({
  pod_id: undefined,
  eta_date: null,
  arrival_date: null,
})

const showFrom = ref(false)

const labelEtaDate = computed(() => {
  if (props.voyage.impoExpo === 'I') return 'ETA *'
  return 'ETD *'
})

const labelAtaDate = computed(() => {
  if (props.voyage.impoExpo === 'I') return 'ATA'
  return 'ATD'
})

const cancelForm = () => {
  showFrom.value = false
}

const searchPorts = async (search: any) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    // Add additional static values to the query if needed
    query['country_id'] = 140
    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

const addDestination = async () => {
  if (!form.pod_id || !form.eta_date) {
    snackbar.add({ type: 'error', text: 'Missing required fields' })
    return
  }

  try {
    loadingStore.start()

    const data = {
      pod_id: form.pod_id,
      eta_date: form.eta_date,
      arrival_date: form.arrival_date,
    }
    console.log(props.voyage.id)

    await $api.voyages.addDestinationToVoyageId(props.voyage.id, data)
    snackbar.add({ type: 'success', text: 'Destination added successfully' })
    showFrom.value = false
    emits('refresh')
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
