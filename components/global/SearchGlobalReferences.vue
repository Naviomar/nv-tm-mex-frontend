<template>
  <div>
    <div class="grid grid-cols-8 gap-5">
      <div class="col-span-5">
        <v-autocomplete
          v-model="form.servicio"
          :items="servicios"
          return-object
          item-title="name"
          label="Service type (optional if you type a full reference below)"
          density="compact"
          @update:model-value="clearForm"
        />
      </div>
      <div class="col-span-3 ml-4">
        <v-btn prepend-icon="mdi-delete-outline" color="red-lighten-3" @click="resetForm">Reset</v-btn>
      </div>
    </div>

    <div v-if="form.servicio" class="grid grid-cols-6 gap-5">
      <div class="col-span-2">
        <v-autocomplete v-model="form.prefixYear" density="compact" :items="prefixYears" label="Prefix" />
      </div>
    </div>

    <div class="mt-2">
      <v-text-field
        v-model="form.serviceNumber"
        density="compact"
        label="Add reference to search"
        :hint="referenceFieldHint"
        persistent-hint
        @keyup.enter="addServiceNumberToSearch"
      />
    </div>

    <div v-if="form.folios.length > 0" class="mt-4">
      <div>Search by</div>
      <div>
        <v-chip
          v-for="(folio, index) in form.folios"
          :key="`service-folio-${folio}`"
          closable
          class="mr-2 mb-2"
          @click:close="removeFolioToSearch(index)"
        >
          {{ form.prefixYear }}-{{ folio }}
        </v-chip>
      </div>
      <v-btn color="primary" class="mt-2" @click="searchServices">Search {{ countFolios }} service(s)</v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

type ServiceType = { id: number; name: string; prefix: string }
type Servicio = {
  servicio: ServiceType | null
  prefixYear: string | null
  folios: string[]
  serviceNumber: string | null
}

const props = defineProps({
  setSearch: {
    type: Object,
    required: false,
    default: () => null,
  },
})

const form = ref<Servicio>({ servicio: null, prefixYear: null, folios: [], serviceNumber: null })
const servicesFound = ref<any>([])

const REFERENCE_REGEX = /^([A-Za-z]{2})(\d{2})-(\d+)$/

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const emit = defineEmits(['update'])

const servicios = [
  { id: 1, name: 'Import Maritime', prefix: 'IM' },
  { id: 2, name: 'Export Maritime', prefix: 'EM' },
  { id: 3, name: 'Import Air', prefix: 'IA' },
  { id: 4, name: 'Export Air', prefix: 'EA' },
]

const prefixYears = computed(() => {
  const years = []
  for (let i = initialYear; i <= maxYear; i++) {
    // last two digits of the year
    const year = i.toString().slice(-2)
    years.push(`${form.value.servicio!.prefix}${year}`)
  }
  return years
})

const referenceFieldHint = computed(() => {
  if (form.value.servicio && form.value.prefixYear) {
    return `Type a folio number (e.g. 2825) or a full reference like ${form.value.prefixYear}-2825. Press Enter to add.`
  }
  return 'Type a full reference like IM26-2825 to auto-fill service type and prefix. Press Enter to add.'
})

const pushFolios = (numbers: string[]) => {
  numbers.forEach((number) => form.value.folios.push(number))
  form.value.folios = [...new Set(form.value.folios)]
}

const addServiceNumberToSearch = () => {
  const raw = form.value.serviceNumber?.trim()
  if (!raw) {
    return
  }

  const fullMatch = raw.match(REFERENCE_REGEX)
  if (fullMatch) {
    const prefix = fullMatch[1]!.toUpperCase()
    const year = fullMatch[2]!
    const number = fullMatch[3]!
    const matchedService = servicios.find((s) => s.prefix === prefix)

    if (!matchedService) {
      snackbar.add({ type: 'warning', text: `Unrecognized service type in reference: ${raw}` })
      form.value.serviceNumber = ''
      return
    }

    const targetPrefixYear = `${prefix}${year}`

    if (form.value.servicio && form.value.servicio.prefix !== prefix) {
      snackbar.add({
        type: 'warning',
        text: `${raw} does not match the selected service type (${form.value.servicio.prefix}). Reset the search to change service type.`,
      })
      form.value.serviceNumber = ''
      return
    }

    if (form.value.prefixYear && form.value.prefixYear !== targetPrefixYear) {
      snackbar.add({
        type: 'warning',
        text: `${raw} belongs to a different prefix/year (${targetPrefixYear}) than the current search (${form.value.prefixYear}). Search current folios first or reset.`,
      })
      form.value.serviceNumber = ''
      return
    }

    form.value.servicio = matchedService
    form.value.prefixYear = targetPrefixYear
    pushFolios([number])
    form.value.serviceNumber = ''
    return
  }

  if (!form.value.servicio || !form.value.prefixYear) {
    snackbar.add({
      type: 'warning',
      text: 'Select a service type and prefix first, or type a full reference like IM26-2825',
    })
    return
  }

  // split by comma and remove empty spaces
  const cleaned = raw.replace(/\s/g, '')
  const refs = Array.from(new Set(cleaned.split(',').filter((ref) => ref)))
  pushFolios(refs)
  form.value.serviceNumber = ''
}

const removeFolioToSearch = (index: number) => {
  form.value.folios?.splice(index, 1)
}

const clearForm = () => {
  form.value.prefixYear = null
  form.value.folios = []
  form.value.serviceNumber = null
  emit('update', { serviceType: null, services: [] })
}

const resetForm = () => {
  form.value.servicio = null
  clearForm()
}

const countFolios = computed(() => {
  return form.value.folios.length
})

const searchServices = async () => {
  try {
    servicesFound.value = []
    loadingStore.loading = true
    // get year from prefixYear
    const year = form.value.prefixYear?.slice(-2)
    const body = {
      serviceType: form.value.servicio?.prefix,
      folios: form.value.folios,
      prefixYear: form.value.prefixYear,
      year: year,
    }
    const response: any = await $api.systemServices.searchServices(body)

    if (response.length <= 0) {
      snackbar.add({ type: 'warning', text: 'No services found' })
    }

    servicesFound.value = response
    emit('update', { serviceType: form.value.servicio?.prefix, services: response })
    snackbar.add({ type: 'success', text: `${response.length} services found` })
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.setSearch,
  (newVal) => {
    if (!newVal) {
      return
    }
    form.value.servicio = servicios.find((s) => s.prefix === newVal.service) || null
    // get las two digits of the year
    const year = newVal.year.slice(-2)
    form.value.prefixYear = `${newVal.service}${year}`
    form.value.serviceNumber = newVal.service_number
    addServiceNumberToSearch()
    searchServices()
  },
  { immediate: true }
)
</script>
