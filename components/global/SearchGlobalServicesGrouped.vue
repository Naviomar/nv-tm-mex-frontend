<template>
  <div>
    <div class="grid grid-cols-8 gap-5 mb-2">
      <div class="col-span-5">
        <v-text-field
          v-model="quickRefs"
          density="compact"
          label="Search by reference # (e.g. IM26-3076)"
          hint="Separate multiple references with commas. Press Enter to search."
          persistent-hint
          prepend-inner-icon="mdi-magnify"
          clearable
          @keyup.enter="searchByReferenceNumbers"
        />
      </div>
      <div class="col-span-3 ml-4">
        <v-btn color="primary" variant="tonal" :disabled="!quickRefs" @click="searchByReferenceNumbers">Search</v-btn>
      </div>
    </div>
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
const form = ref<Servicio>({ servicio: null, prefixYear: null, folios: [], serviceNumber: null })
const servicesFound = ref<any>([])

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const emit = defineEmits(['update'])

const servicios = [
  { id: 1, name: 'Maritime', prefix: 'M' },
  { id: 2, name: 'Air', prefix: 'A' },
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
  quickRefs.value = null
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

const quickRefs = ref<string | null>(null)

// Parses composite references like IM26-3076 / EA25-0012 and searches them with the existing endpoint.
// All references must belong to the same service (maritime or air), as the results are handled as one group.
const searchByReferenceNumbers = async () => {
  const tokens = (quickRefs.value || '')
    .toUpperCase()
    .split(/[\s,;]+/)
    .filter(Boolean)
  if (tokens.length === 0) return

  const parsed = tokens.map((token) => token.match(/^([IE])([MA])(\d{2})-?(\d+)$/))
  const invalid = tokens.filter((_, i) => !parsed[i])
  if (invalid.length > 0) {
    snackbar.add({ type: 'warning', text: `Invalid reference format: ${invalid.join(', ')}` })
    return
  }

  const serviceKinds = new Set(parsed.map((m) => m![2]))
  if (serviceKinds.size > 1) {
    snackbar.add({ type: 'warning', text: 'Search maritime and air references separately.' })
    return
  }

  // group by type + year, one request per group
  const groups: Record<string, { serviceType: string; year: string; folios: string[] }> = {}
  parsed.forEach((m) => {
    const [, impoExpo, kind, year, folio] = m!
    const key = `${impoExpo}${kind}${year}`
    groups[key] ??= { serviceType: `${impoExpo}${kind}`, year, folios: [] }
    groups[key].folios.push(String(Number(folio)))
  })

  try {
    loadingStore.loading = true
    const results = await Promise.all(
      Object.values(groups).map((g) =>
        $api.systemServices.searchServices({ serviceType: g.serviceType, folios: g.folios, year: g.year }),
      ),
    )
    const services = results.flat() as any[]
    const kind = [...serviceKinds][0]

    form.value.servicio = servicios.find((s) => s.prefix === kind) || null
    servicesFound.value = services
    emit('update', { serviceType: kind, services })

    if (services.length === 0) {
      snackbar.add({ type: 'warning', text: 'No services found' })
    } else {
      snackbar.add({ type: 'success', text: `${services.length} of ${tokens.length} service(s) found` })
    }
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
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
</script>
