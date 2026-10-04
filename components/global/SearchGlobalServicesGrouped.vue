<template>
  <div class="rounded-lg tm-panel p-4">
    <div class="flex flex-wrap items-start gap-3">
      <div class="w-44 shrink-0">
        <v-autocomplete
          v-model="defaultPrefix"
          :items="prefixOptions"
          item-title="value"
          item-value="value"
          label="Default prefix"
          density="compact"
          variant="outlined"
          hint="Used for numbers typed without prefix"
          persistent-hint
          clearable
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="item.raw.label" density="compact" />
          </template>
        </v-autocomplete>
      </div>

      <div class="flex-1 min-w-[280px]">
        <v-textarea
          v-model="rawInput"
          label="References to search"
          placeholder="IM26-2932, IM26-2933 2934 ..."
          density="compact"
          variant="outlined"
          rows="1"
          auto-grow
          max-rows="4"
          prepend-inner-icon="mdi-magnify"
          hint="Paste or type references separated by comma, space or new line. Bare numbers use the previous / default prefix. Enter to search."
          persistent-hint
          clearable
          @keydown.enter.exact.prevent="search"
        />
      </div>

      <div class="flex gap-2 pt-1">
        <v-btn color="primary" prepend-icon="mdi-magnify" :disabled="validTokens.length === 0" @click="search">
          Search {{ validTokens.length || '' }}
        </v-btn>
        <v-btn variant="text" color="red" prepend-icon="mdi-restore" @click="resetForm">Reset</v-btn>
      </div>
    </div>

    <!-- Live preview of what is going to be searched -->
    <div v-if="parsedTokens.length > 0 && !hasSearched" class="flex flex-wrap items-center gap-1 mt-3">
      <span class="text-xs text-grey mr-1">Will search:</span>
      <v-chip
        v-for="token in parsedTokens"
        :key="`preview-${token.raw}`"
        size="small"
        :color="token.valid ? 'primary' : 'error'"
        :variant="token.valid ? 'tonal' : 'outlined'"
        :prepend-icon="token.valid ? 'mdi-file-document-outline' : 'mdi-alert-circle-outline'"
      >
        {{ token.valid ? token.reference : `${token.raw} (invalid)` }}
      </v-chip>
    </div>

    <!-- Result summary -->
    <div v-if="hasSearched" class="mt-3">
      <v-alert v-if="mixedKinds" type="warning" density="compact" variant="tonal" class="mb-2">
        Maritime and air references cannot be mixed in the same invoice breakdown. Search them separately.
      </v-alert>
      <div class="flex flex-wrap items-center gap-1">
        <span class="text-xs text-grey mr-1">
          {{ servicesFound.length }} of {{ searchedReferences.length }} found:
        </span>
        <v-chip
          v-for="service in servicesFound"
          :key="`found-${service.id}`"
          size="small"
          color="success"
          variant="tonal"
          prepend-icon="mdi-check-circle"
        >
          {{ service.reference_number }}
        </v-chip>
        <v-chip
          v-for="reference in notFound"
          :key="`missing-${reference}`"
          size="small"
          color="error"
          variant="outlined"
          prepend-icon="mdi-close-circle-outline"
        >
          {{ reference }}
        </v-chip>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const emit = defineEmits(['update'])

type ParsedToken = {
  raw: string
  valid: boolean
  impoExpo?: string
  kind?: string
  year?: string
  folio?: string
  reference?: string
}

const SERVICE_LABELS: Record<string, string> = {
  IM: 'Import maritime',
  EM: 'Export maritime',
  IA: 'Import air',
  EA: 'Export air',
}

const rawInput = ref<string | null>(null)
const defaultPrefix = ref<string | null>(null)
const servicesFound = ref<any[]>([])
const searchedReferences = ref<string[]>([])
const hasSearched = ref(false)
const mixedKinds = ref(false)

const prefixOptions = computed(() => {
  const maxYear = new Date().getFullYear() + 1
  const options: { value: string; label: string }[] = []
  for (let year = maxYear; year >= 2022; year--) {
    const yy = year.toString().slice(-2)
    Object.entries(SERVICE_LABELS).forEach(([code, label]) => options.push({ value: `${code}${yy}`, label: `${label} ${year}` }))
  }
  return options
})

// Tokens like IM26-2932 / IM262932 set the prefix for the following bare numbers (e.g. "IM26-2932 2933 2934").
const parsedTokens = computed<ParsedToken[]>(() => {
  const tokens = (rawInput.value || '').toUpperCase().split(/[\s,;]+/).filter(Boolean)
  let currentPrefix = defaultPrefix.value?.toUpperCase() || null
  const seen = new Set<string>()
  const result: ParsedToken[] = []

  tokens.forEach((raw) => {
    const full = raw.match(/^([IE])([MA])(\d{2})-?(\d+)$/)
    if (full) currentPrefix = `${full[1]}${full[2]}${full[3]}`
    const bare = !full && /^\d+$/.test(raw) && currentPrefix ? `${currentPrefix}${raw}` : null
    const match = full || bare?.match(/^([IE])([MA])(\d{2})(\d+)$/)

    if (!match) {
      result.push({ raw, valid: false })
      return
    }
    const [, impoExpo, kind, year, folio] = match
    const reference = `${impoExpo}${kind}${year}-${Number(folio)}`
    if (seen.has(reference)) return
    seen.add(reference)
    result.push({ raw, valid: true, impoExpo, kind, year, folio: String(Number(folio)), reference })
  })
  return result
})

const validTokens = computed(() => parsedTokens.value.filter((t) => t.valid))

const notFound = computed(() => {
  const found = new Set(servicesFound.value.map((s: any) => normalizeRef(s.reference_number)))
  return searchedReferences.value.filter((ref) => !found.has(normalizeRef(ref)))
})

const normalizeRef = (ref: string) => {
  const m = (ref || '').toUpperCase().match(/^([IE][MA]\d{2})-?0*(\d+)$/)
  return m ? `${m[1]}-${m[2]}` : (ref || '').toUpperCase()
}

watch(rawInput, () => {
  hasSearched.value = false
})

const resetForm = () => {
  rawInput.value = null
  servicesFound.value = []
  searchedReferences.value = []
  hasSearched.value = false
  mixedKinds.value = false
  emit('update', { serviceType: null, services: [] })
}

const search = async () => {
  const invalid = parsedTokens.value.filter((t) => !t.valid)
  if (invalid.length > 0) {
    snackbar.add({ type: 'warning', text: `Invalid reference(s): ${invalid.map((t) => t.raw).join(', ')}` })
  }
  const tokens = validTokens.value
  if (tokens.length === 0) return

  const kinds = new Set(tokens.map((t) => t.kind))
  mixedKinds.value = kinds.size > 1
  if (mixedKinds.value) {
    hasSearched.value = true
    return
  }

  // one request per service type + year
  const groups: Record<string, { serviceType: string; year: string; folios: string[] }> = {}
  tokens.forEach((t) => {
    const key = `${t.impoExpo}${t.kind}${t.year}`
    groups[key] ??= { serviceType: `${t.impoExpo}${t.kind}`, year: t.year!, folios: [] }
    groups[key].folios.push(t.folio!)
  })

  try {
    loadingStore.start()
    const results = await Promise.all(
      Object.values(groups).map((g) =>
        $api.systemServices.searchServices({ serviceType: g.serviceType, folios: g.folios, year: g.year }),
      ),
    )
    const services = (results.flat() as any[]).filter(Boolean)
    servicesFound.value = services
    searchedReferences.value = tokens.map((t) => t.reference!)
    hasSearched.value = true

    emit('update', { serviceType: [...kinds][0], services })

    if (services.length === 0) snackbar.add({ type: 'warning', text: 'No services found' })
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
