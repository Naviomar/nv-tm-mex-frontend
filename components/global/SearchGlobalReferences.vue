<template>
  <div>
    <div class="grid grid-cols-8 gap-5">
      <div class="col-span-5">
        <v-autocomplete
          v-model="form.servicio"
          :items="servicios"
          return-object
          item-title="name"
          label="Service type"
          density="compact"
          @update:model-value="clearForm"
        />
      </div>
      <div class="col-span-3 ml-4">
        <v-btn prepend-icon="mdi-delete-outline" color="red-lighten-3" @click="resetForm">Reset</v-btn>
      </div>
    </div>
    <div v-if="form.servicio">
      <div class="grid grid-cols-6 gap-5">
        <div class="col-span-2">
          <v-autocomplete v-model="form.prefixYear" density="compact" :items="prefixYears" label="Prefix" />
        </div>
        <div class="col-span-4">
          <div v-if="form.prefixYear">
            <v-text-field
              v-model="form.serviceNumber"
              density="compact"
              label="Add Service Ref# to search"
              hint="Press Enter to add"
              @keyup.enter="addServiceNumberToSearch"
            />
          </div>
        </div>
      </div>
      <div v-if="form.folios.length > 0">
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
        <v-btn color="primary" class="mt-4" @click="searchServices">Search {{ countFolios }} service(s)</v-btn>
      </div>
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

const addServiceNumberToSearch = () => {
  if (form.value.serviceNumber) {
    // split by comma and remove empty spaces
    form.value.serviceNumber = form.value.serviceNumber.replace(/\s/g, '')
    const refs = Array.from(new Set(form.value.serviceNumber.split(',')))
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      form.value.folios.push(ref)
    })
    form.value.folios = [...new Set(form.value.folios)]
    form.value.serviceNumber = ''
  }
}

const removeFolioToSearch = (index: number) => {
  form.value.folios?.splice(index, 1)
}

const removeReference = (reference: any) => {
  console.log('removeReference')
  form.value.folios.splice(form.value.folios.indexOf(reference), 1)
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

const folios = computed(() => {
  if (form.value.serviceNumber) {
    let parts = form.value.serviceNumber.split('\n')
    parts = parts.map((part) => part.trim())
    // remove empty strings
    parts = parts.filter((part) => part)
    // unique values
    parts = [...new Set(parts)]
    return parts
  }
  return []
})

const countFolios = computed(() => {
  return form.value.folios.length
})

const searchReferences = () => {
  console.log('search References')
  if (folios.value.length === 0) {
    return
  }
  // api backend search references
  emit('update', folios.value)
}

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
      // console.log('No services found', snackbar)
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
    console.log('watch setSearch', newVal)
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
